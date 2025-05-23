
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/handover/PageContainer";
import { Check, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HandoverData {
  handoverId: string;
  createdAt: string;
  finderName: string;
  finderContact?: string;
  itemDescription: string;
  itemPhoto?: string;
  staffFirstName: string;
  staffLastName: string;
  staffRole?: string;
  staffContact?: string;
  status: string;
  submittedAt: string;
}

const ReportPage = () => {
  const [searchParams] = useSearchParams();
  const handoverId = searchParams.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [handoverData, setHandoverData] = useState<HandoverData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!handoverId) {
      toast({
        title: "Error",
        description: "Missing handover ID",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    const storedData = localStorage.getItem(handoverId);
    if (!storedData) {
      toast({
        title: "Error",
        description: "Handover data not found",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedData);
      setHandoverData(parsedData as HandoverData);
    } catch (err) {
      console.error("Failed to parse handover data:", err);
      toast({
        title: "Error",
        description: "Invalid handover data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [handoverId, navigate, toast]);
  
  const handleFinish = () => {
    toast({
      title: "Handover Complete",
      description: "Thank you for using iFoundIt",
    });
    navigate("/");
  };
  
  if (loading) {
    return (
      <PageContainer title="iFoundIt" subtitle="Loading Handover Report...">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </PageContainer>
    );
  }
  
  if (!handoverData) {
    return null;
  }
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <PageContainer title="iFoundIt" subtitle="Handover Report">
      <Card className="shadow-lg">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-center mb-2">
            <Check className="h-8 w-8 text-green-500 mr-2" />
            <CardTitle className="text-center text-2xl text-green-700">Handover Complete</CardTitle>
          </div>
          <p className="text-center text-gray-600">Reference: {handoverData.handoverId}</p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center">
              <FileText className="mr-2 h-4 w-4" /> Item Details
            </h3>
            <div className="space-y-2 pl-6">
              <div>
                <span className="font-medium">Description:</span>{" "}
                <span className="break-words">{handoverData.itemDescription}</span>
              </div>
              <p><span className="font-medium">Handover Date:</span> {formatDate(handoverData.submittedAt)}</p>
              
              {handoverData.itemPhoto && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Item Photo:</p>
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={handoverData.itemPhoto} 
                      alt="Item" 
                      className="w-full h-auto max-h-48 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t">
            <div className="space-y-2">
              <h3 className="font-medium">Finder Information</h3>
              <p className="text-sm break-words">Name: {handoverData.finderName}</p>
              {handoverData.finderContact && (
                <p className="text-sm break-words">Contact: {handoverData.finderContact}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Recipient Information</h3>
              <p className="text-sm break-words">Name: {handoverData.staffFirstName} {handoverData.staffLastName}</p>
              {handoverData.staffRole && (
                <p className="text-sm break-words">Role: {handoverData.staffRole}</p>
              )}
              {handoverData.staffContact && (
                <p className="text-sm break-words">Contact: {handoverData.staffContact}</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-center">
          <Button onClick={handleFinish} className="px-8">
            Finish
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};

export default ReportPage;
