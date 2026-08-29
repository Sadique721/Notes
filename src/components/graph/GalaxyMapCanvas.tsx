"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ModuleOrbNode from "./ModuleOrbNode";

const MODULES = [
  { slug: "dashboard", title: "Dashboard", description: "Admin panel dashboard counters, margins, and active services.", color: "#10E39B", topicCount: 4, order: 0 },
  { slug: "api-providers", title: "API Providers", description: "Dhru Web Host API integration, credentials, automated order routing.", color: "#22D3EE", topicCount: 4, order: 1 },
  { slug: "services", title: "Unlock Services", description: "Samsung KG Unlock, Xiaomi Bootloader, Oppo/Realme IMEI Repair.", color: "#38BDF8", topicCount: 8, order: 2 },
  { slug: "inventory", title: "Digital Inventory", description: "Tracking key activations, license codes, server credentials.", color: "#A78BFA", topicCount: 3, order: 3 },
  { slug: "orders", title: "Orders Management", description: "Order status lifecycles, pending queues, reference generation.", color: "#FBBF24", topicCount: 3, order: 4 },
  { slug: "users", title: "Users & Tiers", description: "Client accounts, credit limit groups, automated profiles.", color: "#E879F9", topicCount: 3, order: 5 },
  { slug: "message", title: "Support Messages", description: "WhatsApp notification alerts, support tickets, broadcast rules.", color: "#FB7185", topicCount: 3, order: 6 },
  { slug: "payments", title: "Payments funding", description: "Online credit gateway integration, manual balance funding.", color: "#A3E635", topicCount: 3, order: 7 },
  { slug: "invoices", title: "Invoices Billing", description: "PDF billing templates, tax compliance, credit adjustment codes.", color: "#FB923C", topicCount: 3, order: 8 },
  { slug: "currency", title: "Currency & FX", description: "USD/INR conversion margins, multi-currency conversion gate rules.", color: "#60A5FA", topicCount: 3, order: 9 },
];

// 2-row layout
function computeLayout(): { x: number; y: number }[] {
  const positions = [
    { x: 140, y: 80 },   // Dashboard
    { x: 380, y: 80 },   // API Providers
    { x: 620, y: 80 },   // Unlock Services
    { x: 860, y: 80 },   // Digital Inventory
    { x: 1100, y: 80 },  // Orders Management
    { x: 140, y: 320 },  // Users & Tiers
    { x: 380, y: 320 },  // Support Messages
    { x: 620, y: 320 },  // Payments Funding
    { x: 860, y: 320 },  // Invoices Billing
    { x: 1100, y: 320 }, // Currency & FX
  ];
  return positions;
}

const LEARNING_ORDER_EDGES = [
  ["dashboard", "api-providers"],
  ["api-providers", "services"],
  ["services", "inventory"],
  ["inventory", "orders"],
  ["orders", "users"],
  ["users", "payments"],
  ["payments", "invoices"],
  ["invoices", "currency"],
];

const nodeTypes: NodeTypes = { moduleOrb: ModuleOrbNode };

export default function GalaxyMapCanvas() {
  const positions = useMemo(() => computeLayout(), []);

  const initialNodes: Node[] = useMemo(() =>
    MODULES.map((mod, i) => ({
      id: mod.slug,
      type: "moduleOrb",
      position: positions[i],
      data: { ...mod },
      draggable: false,
    })), [positions]);

  const initialEdges: Edge[] = useMemo(() =>
    LEARNING_ORDER_EDGES.map(([source, target]) => ({
      id: `${source}->${target}`,
      source,
      target,
      animated: true,
      style: {
        stroke: "rgba(255,255,255,0.12)",
        strokeWidth: 1.5,
        strokeDasharray: "6 4",
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.2)", width: 12, height: 12 },
    })), []);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((rf: any) => {
    rf.fitView({ padding: 0.15 });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={false}
        panOnDrag={true}
        nodesConnectable={false}
        nodesDraggable={false}
        minZoom={0.4}
        maxZoom={1.8}
        style={{ background: "transparent" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
      </ReactFlow>
    </div>
  );
}
