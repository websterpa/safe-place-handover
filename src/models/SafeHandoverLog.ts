
// SafeHandoverLog model - represents the data structure for handover records

export interface SafeHandoverLog {
  // Unique identifier for the handover record
  id: string;
  
  // The UUID generated for this handover
  handoverId: string;
  
  // Information about the staff member receiving the item
  staffName: string;
  staffRole?: string;
  staffContact?: string;
  
  // Whether the staff confirmed receipt of the item
  confirmed: boolean;
  
  // Timestamp when the handover was submitted
  submittedAt: string;
  
  // Timestamp when the handover was created (for expiry calculation)
  createdAt: string;
}

export interface SafeHandoverRequest {
  // The UUID generated for this handover
  handoverId: string;
  
  // Associated item information
  itemId: string;
  itemDescription?: string;
  
  // Timestamp when the handover was created
  createdAt: string;
  
  // Optional: Information about the finder
  finderName?: string;
  finderContact?: string;
  
  // Status of the handover request
  status: 'pending' | 'completed' | 'expired';
}

// New interface for direct handover
export interface DirectHandoverLog {
  // Unique identifier for the handover record
  id: string;
  
  // The UUID generated for this handover
  handoverId: string;
  
  // Information about the finder
  finderName: string;
  finderContact?: string;
  itemDescription: string;
  
  // Information about the recipient
  staffFirstName: string;
  staffLastName: string;
  staffRole?: string;
  staffContact?: string;
  
  // Whether the recipient confirmed receipt of the item
  confirmed: boolean;
  
  // Timestamps
  createdAt: string;
  submittedAt: string;
  
  // Status of the direct handover
  status: 'initiated' | 'awaiting_recipient' | 'completed' | 'expired';
}
