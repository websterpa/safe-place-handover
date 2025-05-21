
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isHandoverExpired } from "@/utils/uuid";
import FinderForm, { FinderFormValues } from "@/components/handover/FinderForm";
import RecipientForm, { RecipientFormValues } from "@/components/handover/RecipientForm";
import HandoverStatus from "@/components/handover/HandoverStatus";
import PageContainer from "@/components/handover/PageContainer";

const DirectHandover = () => {
  const [searchParams] = useSearchParams();
  const handoverId = searchParams.get("id");
  const { toast } = useToast();
  
  const [finderSubmitted, setFinderSubmitted] = useState(false);
  const [handoverCompleted, setHandoverCompleted] = useState(false);
  const [createdAt] = useState(new Date().toISOString());
  const [itemPhoto, setItemPhoto] = useState<string | null>(null);

  // Check if the handover link is valid
  const isExpired = handoverId && localStorage.getItem(handoverId) 
    ? isHandoverExpired(JSON.parse(localStorage.getItem(handoverId)!).createdAt) 
    : false;

  // Handle photo capture
  const handlePhotoCapture = (photoData: string) => {
    setItemPhoto(photoData);
  };

  // Handle finder form submission
  const onFinderSubmit = (values: FinderFormValues) => {
    if (handoverId) {
      // Save finder data to localStorage
      localStorage.setItem(handoverId, JSON.stringify({
        ...values,
        handoverId,
        createdAt,
        itemPhoto, // Include the item photo in the stored data
        status: 'awaiting_recipient'
      }));
      
      setFinderSubmitted(true);
      
      toast({
        title: "Finder information submitted",
        description: "Please pass the device to the recipient to complete the handover",
      });
    }
  };

  // Handle recipient form submission
  const onRecipientSubmit = (values: RecipientFormValues) => {
    if (handoverId) {
      const finderData = JSON.parse(localStorage.getItem(handoverId) || "{}");
      
      // Update the stored data with recipient information
      const handoverData = {
        ...finderData,
        ...values,
        // Generate a full name from first and last name for backward compatibility if needed
        staffName: `${values.staffFirstName} ${values.staffLastName}`.trim(),
        submittedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      localStorage.setItem(handoverId, JSON.stringify(handoverData));
      
      setHandoverCompleted(true);
      
      toast({
        title: "Handover completed",
        description: "The direct handover has been successfully recorded",
      });
    }
  };

  // Render expired message if the link is expired
  if (isExpired) {
    return <HandoverStatus status="expired" />;
  }

  // Render success message if the handover is completed
  if (handoverCompleted) {
    return <HandoverStatus status="success" />;
  }

  // Render the finder form if not yet submitted
  if (!finderSubmitted) {
    return (
      <PageContainer title="iFoundIt.io" subtitle="Direct Handover - Finder Information">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Finder Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FinderForm onSubmit={onFinderSubmit} onPhotoCapture={handlePhotoCapture} />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Render the recipient form if finder info is submitted
  return (
    <PageContainer title="iFoundIt.io" subtitle="Direct Handover - Recipient Information">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Recipient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <RecipientForm onSubmit={onRecipientSubmit} itemPhoto={itemPhoto} />
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default DirectHandover;
