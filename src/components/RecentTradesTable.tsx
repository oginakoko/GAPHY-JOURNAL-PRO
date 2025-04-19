import { Pencil, Trash2 } from 'lucide-react';
import { Trade } from '../types';

interface Props {
  trades: Trade[];
}

export default function RecentTradesTable({ trades }: Props) {
  const columns = [
    { header: 'Symbol', accessorKey: 'symbol' },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Side', accessorKey: 'side' },
    { header: 'Instrument', accessorKey: 'instrument' },
    { header: 'Qty.', accessorKey: 'qty' },
    { header: 'Price', accessorKey: 'price' },
    { header: 'P/L', accessorKey: 'pl' },
    { 
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-blue-400 cursor-pointer hover:text-blue-300" />
          <Trash2 className="w-4 h-4 text-red-400 cursor-pointer hover:text-red-300" />
        </div>
      )
    }
  ];

  const handleEditTrade = (trade: Trade) => {
    // TODO: Implement edit functionality
    console.log('Edit trade:', trade);
  };

  const handleDeleteTrade = (trade: Trade) => {
    // TODO: Implement delete functionality
    console.log('Delete trade:', trade);
  };

  return (
    <div>
      {/* Render table with columns */}
    </div>
  );
}