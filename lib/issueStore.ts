export {
  addComment,
  createIssue,
  getCommentsByIssueId,
  getIssueById,
  getIssues,
  updateIssueStatus,
  verifyIssue
} from "@/lib/firebase/firestore";

export { uploadIssueImage } from "@/lib/firebase/storage";

export { getIssues as listIssues, getCommentsByIssueId as listComments } from "@/lib/firebase/firestore";
