// import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
// import { Button } from '../components/ui/button';

// interface InventoryItemProps {
//   name: string;
//   quantity: number;
//   category: string;
//   onTake: () => void;
//   onRestock: () => void;
// }

// const InventoryItem = ({
//   name,
//   quantity,
//   category,
//   onTake,
//   onRestock,
// }: InventoryItemProps) => {
//   return (
//     <Card className="hover:shadow-lg transition-shadow">
//       <CardHeader>
//         <h3 className="font-semibold text-lg">{name}</h3>
//       </CardHeader>
//       <CardContent>
//         <p className="text-gray-600">
//           <span className="font-medium">{quantity}</span> remaining
//         </p>
//         <p className="text-sm text-gray-500 mt-1">Category: {category}</p>
//       </CardContent>
//       <CardFooter className="flex justify-between gap-2">
//         <Button variant="outline" className="flex-1" onClick={onTake}>
//           Take
//         </Button>
//         <Button variant="default" className="flex-1" onClick={onRestock}>
//           Restock
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// export default InventoryItem;

export const InventoryItem = ({
    name,
    quantity,
    category
  }: {
    name: string;
    quantity: number;
    category: string;
  }) => {
    return (
      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600">
            <span className="font-medium">{quantity}</span> remaining
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Category: <span className="text-gray-700 font-medium">{category}</span>
          </p>
        </div>
        
        {/* Static Action Buttons */}
        <div className="p-4 bg-gray-50 flex gap-3">
          <div className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 text-center">
            Take
          </div>
          <div className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-center">
            Restock
          </div>
        </div>
      </div>
    );
  };