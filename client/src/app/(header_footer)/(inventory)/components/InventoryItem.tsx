import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import InventoryItemDialog from './InventoryItemDialog';

// This component is used to display an inventory item with its details and provide options to take or restock the item.
// It also handles the dialog for taking or restocking the item.

type InventoryItemProps = {
  name: string;
  description: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  onTake: (amount: number) => Promise<void>;
  onRestock: (amount: number) => Promise<void>;
  refreshStockData: () => void;
};


const InventoryItem = ({
  name,
  description,
  current_stock,
  min_stock,
  unit,
  onTake,
  onRestock,
  refreshStockData,
}: InventoryItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'take' | 'restock' | null>(null);
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const openDialog = (
    type: 'take' | 'restock',
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setDialogType(type);
    setAmount('');
    setFeedback(null);
  };

  const handleConfirm = async () => {
    const numericAmount = parseInt(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFeedback('Please enter a valid positive amount.');
      return;
    }

    try {
      if (dialogType === 'take') {
        await onTake(numericAmount);
        setFeedback('Item successfully taken!');
      } else {
        await onRestock(numericAmount);
        setFeedback('Item successfully restocked!');
      }
      refreshStockData();
      setTimeout(() => setDialogType(null), 3000);
    } catch (error) {
      setFeedback('Something went wrong. Please try again.');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={toggleOpen}>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <h3 className="font-semibold text-lg">{name}</h3>
          {current_stock <= min_stock && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Low Stock
            </span>
          )}
        </div>
      </CardHeader>


      <CardContent>
        <p className="text-gray-600">
          <span className="font-medium">{current_stock}</span> {unit}
          {current_stock !== 1 ? 's' : ''} remaining
        </p>
      </CardContent>

      {isOpen && (
        <>
          <hr className="border-t border-gray-300 mx-4" />
          <CardFooter className="flex flex-col items-start gap-4">
            <p className="text-sm text-gray-600">Description: {description}<br />
              <span className="text-sm text-gray-600 font-semibold">Minimum Stock: {min_stock} {unit}
                {min_stock !== 1 ? 's' : ''} required</span>
            </p>

            <div className="flex justify-center gap-4 self-center">
              <Button variant="outline" onClick={(e) => openDialog('take', e)}>
                Take
              </Button>
              <Button variant="default" onClick={(e) => openDialog('restock', e)}>
                Restock
              </Button>
            </div>
          </CardFooter>
        </>
      )}

      <Dialog
        open={dialogType !== null}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDialogType(null);
            setFeedback(null);
          }
        }}
      >
        <InventoryItemDialog
          dialogType={dialogType}
          amount={amount}
          setAmount={setAmount}
          feedback={feedback}
          handleConfirm={handleConfirm}
          onClose={() => setDialogType(null)}
        />
      </Dialog>
    </Card>
  );
};

export default InventoryItem;
