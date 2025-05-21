
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "@/components/QRCode";
import { generateUUID } from "@/utils/uuid";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
const Index = () => {
  const [handoverId, setHandoverId] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleSafePlaceClick = () => {
    // Generate a unique handover ID
    const uuid = generateUUID();
    setHandoverId(uuid);
    toast({
      title: "Safe handover initiated",
      description: "Show this QR code to staff for handover verification"
    });
  };
  const handleDirectHandoverClick = () => {
    // Generate a unique handover ID
    const uuid = generateUUID();
    console.log("Generated UUID for direct handover:", uuid);

    // Save the creation timestamp to check for expiry later
    const handoverData = {
      handoverId: uuid,
      createdAt: new Date().toISOString(),
      status: 'initiated'
    };
    localStorage.setItem(uuid, JSON.stringify(handoverData));
    console.log("Stored handover data:", handoverData);
    toast({
      title: "Direct handover initiated",
      description: "You will now proceed to the handover form"
    });

    // Navigate to the direct handover page with the ID
    console.log("Navigating to:", `/direct-handover?id=${uuid}`);
    navigate(`/direct-handover?id=${uuid}`);
  };
  return <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">iFoundIt.io</h1>
          <p className="text-gray-600">Secure 'Found' item handover system</p>
        </header>

        {!handoverId ? <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">How would you like to return this item?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="flex flex-col space-y-4">
                <Button className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-lg py-6" onClick={handleSafePlaceClick}>
                  <div className="flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Leave in a safe place
                  </div>
                  <ArrowRight className="h-5 w-5" />
                </Button>
                
                <Button variant="outline" className="flex items-center justify-between text-lg py-6" onClick={handleDirectHandoverClick}>
                  <div>Pass item to Safe Place staff</div>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card> : <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Safe Place Handover</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="text-center mb-4">
                <p className="text-gray-600 mb-4">Show this QR code to local staff to scan with their smartphone for verification</p>
                <div className="bg-white p-6 rounded-lg inline-block shadow">
                  <QRCode handoverId={handoverId} size={200} />
                </div>
              </div>
              
              <div className="text-center max-w-sm border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Handover ID: <span className="font-mono">{handoverId}</span>
                </p>
                <p className="text-sm text-gray-500">
                  This code will expire in 6 hours
                </p>
              </div>

              <div className="mt-4 w-full">
                <Button className="w-full" onClick={() => setHandoverId(null)}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
};
export default Index;
