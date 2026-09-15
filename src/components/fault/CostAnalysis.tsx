import { Check, Edit2, IndianRupee, TrendingDown, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CostAnalysis as CostAnalysisType, CostParameters } from '@/types/fault';
import { formatCurrency } from '@/utils/costCalculator';

interface CostAnalysisProps {
  costAnalysis: CostAnalysisType;
  costParams: CostParameters;
  onCostParamsChange: (params: CostParameters) => void;
}

export function CostAnalysis({
  costAnalysis,
  costParams,
  onCostParamsChange
}: CostAnalysisProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(costParams);

  const handleSave = () => {
    if (editValues.avgSessionValue > 0 && editValues.avgSessionsPerDay > 0) {
      onCostParamsChange(editValues);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValues(costParams);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Impact Calculator</CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Parameters
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="avgSessionValue">Average Session Value (₹)</Label>
              {isEditing ? (
                <Input
                  id="avgSessionValue"
                  type="number"
                  min="1"
                  value={editValues.avgSessionValue}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      avgSessionValue: Number(e.target.value)
                    })
                  }
                  className="mt-1"
                />
              ) : (
                <div className="text-2xl font-bold mt-1">
                  {formatCurrency(costParams.avgSessionValue)}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="avgSessionsPerDay">Average Sessions per Day</Label>
              {isEditing ? (
                <Input
                  id="avgSessionsPerDay"
                  type="number"
                  min="1"
                  value={editValues.avgSessionsPerDay}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      avgSessionsPerDay: Number(e.target.value)
                    })
                  }
                  className="mt-1"
                />
              ) : (
                <div className="text-2xl font-bold mt-1">
                  {costParams.avgSessionsPerDay}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2 text-destructive" />
                  Revenue Lost Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(costAnalysis.revenueToday)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <IndianRupee className="h-4 w-4 mr-2 text-destructive" />
                  Revenue Lost This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(costAnalysis.revenueThisMonth)}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {costAnalysis.topCostliestFaults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Costliest Faults</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costAnalysis.topCostliestFaults.map((fault, index) => (
                <div
                  key={fault.faultType}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{fault.faultType}</div>
                      <div className="text-sm text-muted-foreground">
                        {fault.occurrences} occurrence{fault.occurrences !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-destructive">
                      {formatCurrency(fault.totalCost)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
