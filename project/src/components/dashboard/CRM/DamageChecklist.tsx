import React from 'react';

type Item = { id: string; label: string };

const defaultItems: Item[] = [
  { id: 'left-side', label: 'Left side panels' },
  { id: 'right-side', label: 'Right side panels' },
  { id: 'bucket', label: 'Bucket/Attachment' },
  { id: 'glass', label: 'Windows/Glass' },
  { id: 'tracks', label: 'Tracks/Tires' },
  { id: 'hydraulics', label: 'Hoses/Hydraulics leaks' },
  { id: 'lights', label: 'Lights/Indicators' },
  { id: 'misc', label: 'Other visible damage' },
];

export default function DamageChecklist({
  items = defaultItems,
  onStartCapture,
}: {
  items?: Item[];
  onStartCapture?: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">Pre/Post rental quick inspection checklist. Capture photos for any item with damage.</div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 text-sm">
            <input id={`chk-${it.id}`} type="checkbox" className="h-4 w-4" />
            <label htmlFor={`chk-${it.id}`}>{it.label}</label>
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onStartCapture}
          className="px-3 py-2 text-sm bg-blue-900 text-white rounded-md hover:bg-blue-800"
        >
          Start Photo Capture
        </button>
      </div>
    </div>
  );
}
