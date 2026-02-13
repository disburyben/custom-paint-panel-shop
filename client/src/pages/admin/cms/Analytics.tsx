import { Card } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">View website statistics and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Visitors</p>
          <p className="text-3xl font-bold">--</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm mb-2">Page Views</p>
          <p className="text-3xl font-bold">--</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm mb-2">Bounce Rate</p>
          <p className="text-3xl font-bold">--</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm mb-2">Avg. Session</p>
          <p className="text-3xl font-bold">--</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Analytics Coming Soon</h2>
        <p className="text-muted-foreground">
          Detailed analytics and performance metrics will be available soon. 
          Check back later for comprehensive website statistics.
        </p>
      </Card>
    </div>
  );
}
