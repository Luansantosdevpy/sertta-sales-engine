export type AssistantIntent =
  | 'schedule_request'
  | 'order_request'
  | 'product_question'
  | 'support_question'
  | 'fallback';

export type AssistantActionType =
  | 'appointment.create'
  | 'order.create'
  | 'knowledge.answer'
  | 'human.handoff'
  | 'message.reply';
