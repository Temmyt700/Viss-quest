import { fundingService } from "../funding/funding.service.js";

export const moderatorService = {
  listFundingRequests: () => fundingService.listPending(),
  approveFunding: (requestId: string, actorUserId: string) => fundingService.approve(requestId, actorUserId),
  rejectFunding: (requestId: string, actorUserId: string) => fundingService.reject(requestId, actorUserId),
};
