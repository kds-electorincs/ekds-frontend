import React from 'react';
import Link from 'next/link';
import { Settings, Wrench, MessageSquare, ArrowRight } from 'lucide-react';
import styles from '../../app/(storefront)/Homepage.module.css';

const toolsColumns = [
  {
    title: "B2B Tools",
    icon: <Settings className="text-blue-600" size={24} />,
    items: [
      { label: "BOM Upload List", desc: "Submit your wholesale spreadsheet parts list", path: "/user/quotations" },
      { label: "Price Calculator", desc: "Estimate volume discounts & custom quotes", path: "/products" },
      { label: "Bulk Order Entry", desc: "Enter codes and counts to purchase directly", path: "/products" }
    ]
  },
  {
    title: "Customer Services",
    icon: <Wrench className="text-blue-600" size={24} />,
    items: [
      { label: "Live Order Tracking", desc: "Track shipment details & carrier status", path: "/user/orders" },
      { label: "Custom B2B Quotations", desc: "Submit specifications for special pricing", path: "/user/quotations" },
      { label: "ERP API Integrations", desc: "Sync catalog inventory with internal systems", path: "/" }
    ]
  },
  {
    title: "Technical Resources",
    icon: <MessageSquare className="text-blue-600" size={24} />,
    items: [
      { label: "New Product Catalog", desc: "Browse recently added B2B components", path: "/products" },
      { label: "Datasheets & Manuals", desc: "Download safety specs and usage guides", path: "/products" },
      { label: "Technical Support Forum", desc: "Read tutorials and troubleshoot gear", path: "/" }
    ]
  }
];

export default function QuickToolsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {toolsColumns.map((col, index) => (
        <div key={index} className={styles.toolCard}>
          <div className="flex items-center mb-4">
            {col.icon}
            <h3 className="text-lg font-extrabold text-slate-800 ml-3 tracking-wide">
              {col.title}
            </h3>
          </div>
          
          <hr className="border-gray-200 mb-4" />

          <ul className="space-y-5">
            {col.items.map((item, i) => (
              <li key={i} className="flex flex-col">
                <Link 
                  href={item.path}
                  className="group inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800 hover:underline transition-all"
                >
                  {item.label}
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  {item.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
