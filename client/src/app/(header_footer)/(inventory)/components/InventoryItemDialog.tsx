import { DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type InventoryItemDialogProps = {
  dialogType: 'take' | 'restock' | null;
  amount: string;
  setAmount: (value: string) => void;
  feedback: string | null;
  handleConfirm: () => void;
  onClose: () => void;
};

const InventoryItemDialog = ({
  dialogType,
  amount,
  setAmount,
  feedback,
  handleConfirm,
  onClose,
}: InventoryItemDialogProps) => {
  return (
    <DialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()} className="rounded-lg shadow-xl">
      <DialogHeader>
        <DialogTitle>
          {dialogType === 'take' ? 'Take Item' : 'Restock Item'}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-2 mt-4">
        <label htmlFor="amount" className="text-sm font-medium text-gray-700">
          Amount
        </label>
        <Input
          id="amount"
          type="number"
          min={1}
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <DialogFooter className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={async () => {
            await handleConfirm();
            setTimeout(onClose, 3000);
          }}
          disabled={!amount}
        >
          Confirm
        </Button>
      </DialogFooter>

      {feedback && (
        <p
          className={`text-sm text-center ${
            feedback.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {feedback.toLowerCase().includes('success') ? '✅' : '❌'} {feedback}
        </p>
      )}

    </DialogContent>
  );
};

export default InventoryItemDialog;
