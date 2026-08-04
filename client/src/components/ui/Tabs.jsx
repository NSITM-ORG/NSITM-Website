/**
 * Tabs — simple controlled tab strip. Used for FAQ category filters and
 * the Super Admin Settings sections (Bank Details / WhatsApp / Institution).
 */

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto ">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer shrink-0 overflow-hidden whitespace-nowrap
            ${
              activeTab === tab.value
                ? "bg-primary text-white shadow-md "
                : "bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-primary/10 border border-primary/10"
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