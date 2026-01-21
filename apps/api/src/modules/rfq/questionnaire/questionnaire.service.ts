import { prisma } from '../../../lib/prisma.js';
import { knowledgeBaseService } from '../knowledge-base/knowledge-base.service.js';
import { questionnaireTemplates, coverageRules } from './questionnaire.templates.js';
import type { QuestionnaireAnswers, Rule, RuleAction } from './questionnaire.types.js';

export interface CoverageRecommendation {
  policyType: string;
  policyTypeHe: string;
  recommendedLimit: number;
  isMandatory: boolean;
  endorsements: string[];
  description?: string;
  descriptionHe?: string;
  adjustmentReason?: string;
}

export class QuestionnaireService {
  // Get questionnaire template by sector
  getTemplate(sector: string) {
    return questionnaireTemplates[sector] || questionnaireTemplates['GENERIC'];
  }

  // Get all available sectors
  getAvailableSectors() {
    return Object.keys(questionnaireTemplates).filter((s) => s !== 'GENERIC');
  }

  // Save questionnaire answers
  async saveAnswers(clientId: string, answers: QuestionnaireAnswers, status = 'draft') {
    return prisma.rfqQuestionnaire.create({
      data: {
        clientId,
        answers,
        status,
      },
    });
  }

  // Update questionnaire answers
  async updateAnswers(questionnaireId: string, answers: QuestionnaireAnswers, status?: string) {
    return prisma.rfqQuestionnaire.update({
      where: { id: questionnaireId },
      data: {
        answers,
        ...(status && { status }),
      },
    });
  }

  // Get questionnaire by ID
  async getQuestionnaire(questionnaireId: string) {
    return prisma.rfqQuestionnaire.findUnique({
      where: { id: questionnaireId },
      include: { client: true },
    });
  }

  // Get questionnaires for a client
  async getClientQuestionnaires(clientId: string) {
    return prisma.rfqQuestionnaire.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Generate coverage recommendations based on answers
  async generateRecommendations(
    sector: string,
    answers: QuestionnaireAnswers
  ): Promise<CoverageRecommendation[]> {
    // Get base requirements from knowledge base
    const baseRequirements = await knowledgeBaseService.findBySector(sector);

    if (baseRequirements.length === 0) {
      // Fall back to generic requirements
      const genericRequirements = await knowledgeBaseService.findBySector('GENERIC');
      if (genericRequirements.length === 0) {
        return [];
      }
    }

    // Initialize recommendations from base requirements
    const recommendations: Map<string, CoverageRecommendation> = new Map();

    for (const req of baseRequirements) {
      recommendations.set(req.policyType, {
        policyType: req.policyType,
        policyTypeHe: req.policyTypeHe,
        recommendedLimit: Number(req.recommendedLimit) || 0,
        isMandatory: req.isMandatory,
        endorsements: (req.commonEndorsements as string[]) || [],
        description: req.description || undefined,
        descriptionHe: req.descriptionHe || undefined,
      });
    }

    // Apply rules based on answers
    const applicableRules = this.evaluateRules(answers);

    for (const rule of applicableRules) {
      for (const action of rule.actions) {
        this.applyAction(recommendations, action, rule.name);
      }
    }

    return Array.from(recommendations.values()).sort((a, b) => {
      // Mandatory first, then by limit
      if (a.isMandatory !== b.isMandatory) return a.isMandatory ? -1 : 1;
      return b.recommendedLimit - a.recommendedLimit;
    });
  }

  // Evaluate which rules apply based on answers
  private evaluateRules(answers: QuestionnaireAnswers): Rule[] {
    const applicableRules: Rule[] = [];

    for (const rule of coverageRules) {
      const allConditionsMet = rule.conditions.every((condition) => {
        const value = answers[condition.field];
        if (value === undefined || value === null) return false;

        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'notEquals':
            return value !== condition.value;
          case 'greaterThan':
            return typeof value === 'number' && value > (condition.value as number);
          case 'lessThan':
            return typeof value === 'number' && value < (condition.value as number);
          case 'in':
            return Array.isArray(condition.value) && condition.value.includes(value as string);
          case 'contains':
            return (
              Array.isArray(value) && value.includes(condition.value as string)
            );
          default:
            return false;
        }
      });

      if (allConditionsMet) {
        applicableRules.push(rule);
      }
    }

    // Sort by priority (lower number = higher priority)
    return applicableRules.sort((a, b) => a.priority - b.priority);
  }

  // Apply a rule action to recommendations
  private applyAction(
    recommendations: Map<string, CoverageRecommendation>,
    action: RuleAction,
    ruleName: string
  ) {
    const policyType = action.policyType;
    if (!policyType) return;

    let rec = recommendations.get(policyType);

    switch (action.type) {
      case 'addPolicy':
        if (!rec) {
          recommendations.set(policyType, {
            policyType,
            policyTypeHe: policyType, // Should be translated
            recommendedLimit: action.amount || 5000000,
            isMandatory: action.mandatory || false,
            endorsements: [],
            adjustmentReason: ruleName,
          });
        }
        break;

      case 'removePolicy':
        recommendations.delete(policyType);
        break;

      case 'adjustLimit':
        if (rec && action.multiplier) {
          rec.recommendedLimit = Math.round(rec.recommendedLimit * action.multiplier);
          rec.adjustmentReason = (rec.adjustmentReason ? rec.adjustmentReason + ', ' : '') + ruleName;
        }
        break;

      case 'addEndorsement':
        if (rec && action.endorsement) {
          if (!rec.endorsements.includes(action.endorsement)) {
            rec.endorsements.push(action.endorsement);
          }
        }
        break;

      case 'setMandatory':
        if (rec) {
          rec.isMandatory = action.mandatory ?? true;
        }
        break;
    }
  }

  // Calculate risk score from answers
  calculateRiskScore(sector: string, answers: QuestionnaireAnswers): number {
    const template = this.getTemplate(sector);
    if (!template) {
      return 50; // Default medium risk if no template found
    }
    let totalWeight = 0;
    let weightedScore = 0;

    for (const section of template.sections) {
      for (const question of section.questions) {
        if (question.riskWeight) {
          totalWeight += Math.abs(question.riskWeight);
          const answer = answers[question.id];

          if (answer !== undefined && answer !== null) {
            // Normalize answer to 0-1 scale based on type
            let normalizedValue = 0;

            switch (question.type) {
              case 'boolean':
                normalizedValue = answer === true ? 1 : 0;
                break;
              case 'number':
              case 'currency':
                // Normalize based on min/max if available
                const numVal = Number(answer);
                const min = question.min || 0;
                const max = question.max || numVal * 2;
                normalizedValue = (numVal - min) / (max - min);
                break;
              case 'select':
                // Assume later options = higher risk
                const options = question.options || [];
                const idx = options.findIndex((o) => o.value === answer);
                normalizedValue = idx >= 0 ? idx / (options.length - 1) : 0;
                break;
              case 'multiselect':
                // More selections = higher risk
                const selections = Array.isArray(answer) ? answer.length : 0;
                const totalOptions = question.options?.length || 1;
                normalizedValue = selections / totalOptions;
                break;
            }

            // Apply risk weight (can be negative for risk-reducing factors)
            if (question.riskWeight > 0) {
              weightedScore += normalizedValue * question.riskWeight;
            } else {
              weightedScore += (1 - normalizedValue) * Math.abs(question.riskWeight);
            }
          }
        }
      }
    }

    // Return score as percentage (0-100)
    return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 50;
  }
}

export const questionnaireService = new QuestionnaireService();
