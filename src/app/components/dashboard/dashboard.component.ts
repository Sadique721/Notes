import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { NavigationService } from '../../services/navigation.service';

interface Order {
  ref: string;
  user: string;
  service: string;
  price: string;
  status: 'Pending' | 'Processing' | 'Success' | 'Rejected';
  date: string;
  topicSlug?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  public searchQuery: string = '';
  public activeTab: 'Pending' | 'Processing' | 'Success' | 'Rejected' = 'Pending';

  public orders: Order[] = [
    { ref: 'ORD-310725-1001', user: 'GenTechPro', service: 'Samsung KG Unlock', price: '₹2,500.00', status: 'Pending', date: '31-07-2025 12:42 PM', topicSlug: 'what-is-spring' },
    { ref: 'ORD-310725-1002', user: 'MobileFixer01', service: 'Xiaomi Bootloader Unlock', price: '₹1,800.00', status: 'Pending', date: '31-07-2025 12:30 PM', topicSlug: 'ioc' },
    { ref: 'ORD-310725-1003', user: 'UnlockMaster', service: 'Oppo IMEI Repair', price: '₹3,200.00', status: 'Pending', date: '31-07-2025 12:35 PM', topicSlug: 'bean-lifecycle' },
    { ref: 'ORD-310725-1004', user: 'TechSolution', service: 'OnePlus FRP Remove', price: '₹900.00', status: 'Pending', date: '31-07-2025 12:28 PM', topicSlug: 'component-scanning' },
    { ref: 'ORD-310725-1005', user: 'AndroidGuru', service: 'Realme IMEI Repair', price: '₹3,000.00', status: 'Pending', date: '31-07-2025 12:25 PM', topicSlug: 'virtual-threads' },
    { ref: 'ORD-310725-1006', user: 'ToolDealer', service: 'Unlock Tool Activation (1 Year)', price: '₹4,500.00', status: 'Pending', date: '31-07-2025 12:20 PM', topicSlug: 'eureka' },
    { ref: 'ORD-310725-1007', user: 'GsmClinic', service: 'iCloud Bypass (Full)', price: '₹2,700.00', status: 'Pending', date: '31-07-2025 12:15 PM', topicSlug: 'api-gateway' },
    { ref: 'ORD-310725-1008', user: 'FlashKing', service: 'CPU / eMMC Reprogramming', price: '₹2,200.00', status: 'Pending', date: '31-07-2025 12:10 PM', topicSlug: 'circuit-breaker' }
  ];

  constructor(private router: Router, public navService: NavigationService) {}

  public get filteredOrders(): Order[] {
    return this.orders.filter(order => {
      const matchesSearch = 
        order.ref.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.user.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.service.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = order.status === this.activeTab;
      return matchesSearch && matchesStatus;
    });
  }

  public selectTab(tab: 'Pending' | 'Processing' | 'Success' | 'Rejected') {
    this.activeTab = tab;
  }

  public navigateToTopic(slug: string | undefined) {
    if (slug) {
      this.router.navigate(['/topic', slug]);
    }
  }
}
