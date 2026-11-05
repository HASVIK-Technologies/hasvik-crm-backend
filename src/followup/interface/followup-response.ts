import { Types } from "mongoose";
import { Business, FollowUp, Note, Tag, User } from "src/mongo/interfaces";

export interface FollowUpResponse
  extends Omit<FollowUp, 'businessId' | 'assignedTo'> {
  business: Business | null;
  assignee: User | null;
  tags: Tag[];
}
