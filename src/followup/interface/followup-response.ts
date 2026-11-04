import { Types } from "mongoose";
import { Business, FollowUp, Note, User } from "src/mongo/interfaces";

export interface FollowUpResponse
  extends Omit<FollowUp, 'businessId' | 'assignedTo'> {
  business: Business | null;
  assignee: User | null;
  tags?: {
      _id: Types.ObjectId;
      name: string;
      key: string;
      color: string;
    }[];
}
