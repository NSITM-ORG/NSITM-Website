/**
 * Tabs — simple controlled tab strip. Used for FAQ category filters and
 * the Super Admin Settings sections (Bank Details / WhatsApp / Institution).
 */

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors
            ${
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;