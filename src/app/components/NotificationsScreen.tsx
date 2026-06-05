import React from "react";
import { ChevronLeft, Package, Bell, ShoppingBag, Truck } from "lucide-react";
import { Card } from "./ui/card";

interface NotificationsScreenProps {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const notifications = [
    {
      id: 1,
      title: "Comanda ta este pe drum!",
      description: "Comanda #1002 a fost predată curierului și va ajunge la tine în curând.",
      time: "Acum 2 ore",
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      unread: true
    },
    {
      id: 2,
      title: "Produs din nou în stoc",
      description: "iPhone 15 Pro Max 256GB este acum disponibil. Grăbește-te, stocul este limitat!",
      time: "Ieri, 14:30",
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-100",
      unread: true
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-safe">
      <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">Notificări</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.map(notif => {
          const Icon = notif.icon;
          return (
            <Card key={notif.id} className={`p-4 border ${notif.unread ? 'border-primary/20 bg-white shadow-sm' : 'border-gray-100 bg-gray-50/50'} relative overflow-hidden`}>
              {notif.unread && <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />}
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.bgColor}`}>
                  <Icon className={`h-5 w-5 ${notif.color}`} />
                </div>
                <div>
                  <h3 className={`text-sm ${notif.unread ? 'font-bold' : 'font-medium'}`}>{notif.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.description}</p>
                  <span className="text-[10px] text-muted-foreground/70 font-medium block mt-2">{notif.time}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
