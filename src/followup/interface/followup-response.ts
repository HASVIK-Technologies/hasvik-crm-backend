import { Business, FollowUp, User } from "src/mongo/interfaces";

export interface FollowUpResponse
  extends Omit<FollowUp, 'businessId' | 'assignedTo'> {
  business: Business | null;
  assignee: User | null;
}
