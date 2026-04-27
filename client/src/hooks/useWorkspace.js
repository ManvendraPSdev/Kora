import { useDispatch, useSelector } from "react-redux";
import {
  addTicketMessageThunk,
  bootstrapWorkspaceThunk,
  clearWorkspaceFlash,
  createKbArticleThunk,
  createTicketThunk,
  createUserThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  selectTicketThunk,
  sendChatMessageThunk,
  setActiveSection,
  startChatSessionThunk,
  suggestRepliesThunk,
  updateTicketStatusThunk,
} from "../state/slices/workspaceSlice";


export function useWorkspace() {
  const dispatch = useDispatch();
  const workspace = useSelector((state) => state.workspace);

  return {
    ...workspace,
    setActiveSection: (section) => dispatch(setActiveSection(section)),
    clearFlash: () => dispatch(clearWorkspaceFlash()),
    bootstrap: () => dispatch(bootstrapWorkspaceThunk()).unwrap(),
    createTicket: (payload) => dispatch(createTicketThunk(payload)).unwrap(),
    selectTicket: (ticketId) => dispatch(selectTicketThunk(ticketId)).unwrap(),
    addTicketMessage: (payload) => dispatch(addTicketMessageThunk(payload)).unwrap(),
    updateTicketStatus: (payload) => dispatch(updateTicketStatusThunk(payload)).unwrap(),
    suggestReplies: (ticketId) => dispatch(suggestRepliesThunk(ticketId)).unwrap(),
    createKbArticle: (payload) => dispatch(createKbArticleThunk(payload)).unwrap(),
    createUser: (payload) => dispatch(createUserThunk(payload)).unwrap(),
    startChatSession: () => dispatch(startChatSessionThunk()).unwrap(),
    sendChatMessage: (payload) => dispatch(sendChatMessageThunk(payload)).unwrap(),
    forgotPassword: (email) => dispatch(forgotPasswordThunk(email)).unwrap(),
    resetPassword: (payload) => dispatch(resetPasswordThunk(payload)).unwrap(),
  };
}
