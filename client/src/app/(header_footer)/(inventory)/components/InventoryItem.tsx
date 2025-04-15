
type InventoryItemProps = {
  name: string;
  description: string;
  safetyInfo: string | null;
  approval: boolean;
  quantity: number;
};

export const InventoryItem = ({
  name,
  description,
  safetyInfo,
  approval,
  quantity,
}: InventoryItemProps) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="text-gray-600">
          <span className="font-medium">{description}</span>
        </p>
        <p className="text-sm text-gray-500">
          Safety Info:{" "}
          <span className="text-gray-700 font-medium">
            {safetyInfo ?? "None provided"}
          </span>
        </p>
        <p className="text-sm text-gray-500">
          Approved:{" "}
          <span className={approval ? "text-green-600" : "text-red-600"}>
            {approval ? "Yes" : "No"}
          </span>
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-medium">{quantity}</span> remaining
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
