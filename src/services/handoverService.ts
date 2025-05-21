
import { SafeHandoverLog, SafeHandoverRequest } from "@/models/SafeHandoverLog";

// In a real application, this would interact with your backend API
// For this demo, we'll simulate with localStorage

// Generate a new handover request
export const createHandoverRequest = async (itemId: string, itemDescription?: string): Promise<SafeHandoverRequest> => {
  try {
    const handoverId = crypto.randomUUID();
    
    const handoverRequest: SafeHandoverRequest = {
      handoverId,
      itemId,
      itemDescription,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    // Store in localStorage for demo purposes
    // In a real app, this would be an API call to your backend
    const requests = JSON.parse(localStorage.getItem('handoverRequests') || '[]');
    requests.push(handoverRequest);
    localStorage.setItem('handoverRequests', JSON.stringify(requests));
    
    return handoverRequest;
  } catch (error) {
    console.error("Error creating handover request:", error);
    throw new Error("Failed to create handover request");
  }
};

// Save a handover log when staff completes the form
export const submitHandoverLog = async (handoverData: Omit<SafeHandoverLog, 'id' | 'submittedAt'>): Promise<SafeHandoverLog> => {
  try {
    const handoverLog: SafeHandoverLog = {
      ...handoverData,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    
    // Store in localStorage for demo purposes
    const logs = JSON.parse(localStorage.getItem('handoverLogs') || '[]');
    logs.push(handoverLog);
    localStorage.setItem('handoverLogs', JSON.stringify(logs));
    
    // Update the request status to completed
    const requests = JSON.parse(localStorage.getItem('handoverRequests') || '[]');
    const updatedRequests = requests.map((req: SafeHandoverRequest) => 
      req.handoverId === handoverData.handoverId 
        ? { ...req, status: 'completed' } 
        : req
    );
    localStorage.setItem('handoverRequests', JSON.stringify(updatedRequests));
    
    return handoverLog;
  } catch (error) {
    console.error("Error submitting handover log:", error);
    throw new Error("Failed to submit handover");
  }
};

// Get a handover request by ID
export const getHandoverRequestById = async (handoverId: string): Promise<SafeHandoverRequest | null> => {
  try {
    const requests = JSON.parse(localStorage.getItem('handoverRequests') || '[]');
    const request = requests.find((req: SafeHandoverRequest) => req.handoverId === handoverId);
    
    if (!request) {
      return null;
    }
    
    // Check if expired (6 hours)
    const creationTime = new Date(request.createdAt).getTime();
    const currentTime = new Date().getTime();
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    
    if ((currentTime - creationTime) > sixHoursInMs && request.status === 'pending') {
      // Update status to expired
      const updatedRequests = requests.map((req: SafeHandoverRequest) => 
        req.handoverId === handoverId 
          ? { ...req, status: 'expired' } 
          : req
      );
      localStorage.setItem('handoverRequests', JSON.stringify(updatedRequests));
      
      return { ...request, status: 'expired' };
    }
    
    return request;
  } catch (error) {
    console.error("Error getting handover request:", error);
    return null;
  }
};

// Get logs for a specific handover
export const getHandoverLogs = async (handoverId: string): Promise<SafeHandoverLog[]> => {
  try {
    const logs = JSON.parse(localStorage.getItem('handoverLogs') || '[]');
    return logs.filter((log: SafeHandoverLog) => log.handoverId === handoverId);
  } catch (error) {
    console.error("Error getting handover logs:", error);
    return [];
  }
};
