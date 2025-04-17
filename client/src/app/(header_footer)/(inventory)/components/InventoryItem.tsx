import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type InventoryItemProps = {
  name: string;
  description: string;
  current_stock: number;
  unit: string;
  onTake: () => void;
  onRestock: () => void;
};

const InventoryItem = ({
  name,
  description,
  current_stock,
  unit,
  onTake,
  onRestock,
}: InventoryItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={toggleOpen}
    >
      <CardHeader>
        <h3 className="font-semibold text-lg">{name}</h3>
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
            <p className="text-sm text-gray-600">Description: {description}</p>
            <div className="flex justify-center gap-4 self-center">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onTake();
                }}
              >
                Take
              </Button>
              <Button
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestock();
                }}
              >
                Restock
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default InventoryItem;
