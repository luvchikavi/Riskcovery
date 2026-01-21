// Question types for the dynamic questionnaire
export type QuestionType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'date'
  | 'currency';

export interface QuestionOption {
  value: string;
  label: string;
  labelHe: string;
}

export interface QuestionCondition {
  questionId: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in';
  value: string | number | boolean | string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  labelHe: string;
  description?: string;
  descriptionHe?: string;
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  placeholderHe?: string;
  min?: number;
  max?: number;
  // Conditional display
  showIf?: QuestionCondition[];
  // Risk impact
  riskWeight?: number;
  affectsPolicy?: string[];
}

export interface QuestionSection {
  id: string;
  title: string;
  titleHe: string;
  description?: string;
  descriptionHe?: string;
  questions: Question[];
  showIf?: QuestionCondition[];
}

export interface Questionnaire {
  id: string;
  sector: string;
  version: string;
  sections: QuestionSection[];
}

export type QuestionnaireAnswerValue = string | number | boolean | string[] | null | undefined;

export interface QuestionnaireAnswers {
  [questionId: string]: QuestionnaireAnswerValue;
}

// Rule engine types
export interface RuleCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'in' | 'contains';
  value: unknown;
}

export interface RuleAction {
  type: 'addPolicy' | 'removePolicy' | 'adjustLimit' | 'addEndorsement' | 'setMandatory';
  policyType?: string;
  endorsement?: string;
  multiplier?: number;
  amount?: number;
  mandatory?: boolean;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
}
