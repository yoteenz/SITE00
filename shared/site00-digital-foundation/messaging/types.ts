export type ProjectMessageAuthorRole = 'CLIENT' | 'FOUNDER';

export type ProjectMessageDeliveryState = 'DELIVERED' | 'FAILED';

export type ProjectMessage = {
  message_id: string;
  artifact_id: string;
  author_role: ProjectMessageAuthorRole;
  body: string;
  created_at: string;
  delivery_state: ProjectMessageDeliveryState;
  read_by_client_at: string | null;
  read_by_founder_at: string | null;
};
