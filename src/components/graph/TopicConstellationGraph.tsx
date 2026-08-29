"use client";
import React, { useMemo } from "react";
import {
  ReactFlow, Background, BackgroundVariant,
  useNodesState, useEdgesState, NodeTypes, Node, Edge, MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TopicNode from "./TopicNode";

interface Topic {
  slug: string; title: string; estimatedReadMinutes: number;
  generated: boolean; qaCount: number; diagramCount: number;
  prerequisiteTopicSlugs: string[];
}
interface Props {
  topics: Topic[]; moduleSlug: string; accentColor: string; visitedSlugs: string[];
}

const nodeTypes: NodeTypes = { topicNode: TopicNode };

export default function TopicConstellationGraph({ topics, moduleSlug, accentColor, visitedSlugs }: Props) {
  const nodes: Node[] = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(topics.length));
    return topics.map((t, i) => ({
      id: t.slug,
      type: "topicNode",
      position: { x: (i % cols) * 290 + 20, y: Math.floor(i / cols) * 240 + 20 },
      data: {
        title: t.title, slug: t.slug, moduleSlug,
        color: accentColor,
        estimatedReadMinutes: t.estimatedReadMinutes,
        generated: t.generated,
        qaCount: t.qaCount,
        diagramCount: t.diagramCount,
        visitedProgress: visitedSlugs.includes(t.slug) ? 100 : 0,
        prerequisiteTopicSlugs: t.prerequisiteTopicSlugs || [],
      },
      draggable: false,
    }));
  }, [topics, moduleSlug, accentColor, visitedSlugs]);

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    topics.forEach(t => {
      (t.prerequisiteTopicSlugs || []).forEach((prereq: string) => {
        if (topics.some(tp => tp.slug === prereq)) {
          // Check if prerequisite is completed
          const isCompleted = visitedSlugs.includes(prereq);
          result.push({
            id: `${prereq}->${t.slug}`,
            source: prereq, target: t.slug,
            animated: isCompleted, // only animate edge flow if completed/unlocked!
            style: { 
              stroke: isCompleted ? accentColor : "rgba(255,255,255,0.06)", 
              strokeWidth: isCompleted ? 2 : 1, 
              strokeDasharray: isCompleted ? undefined : "4 4" 
            },
            markerEnd: { 
              type: MarkerType.ArrowClosed, 
              color: isCompleted ? accentColor : "rgba(255,255,255,0.1)", 
              width: 10, 
              height: 10 
            },
          });
        }
      });
    });
    return result;
  }, [topics, accentColor, visitedSlugs]);

  const [n, , onNC] = useNodesState(nodes);
  const [e, , onEC] = useEdgesState(edges);

  return (
    <ReactFlow nodes={n} edges={e} nodeTypes={nodeTypes}
      onNodesChange={onNC} onEdgesChange={onEC}
      fitView fitViewOptions={{ padding: 0.15 }}
      proOptions={{ hideAttribution: true }}
      zoomOnScroll={false} panOnDrag={true}
      nodesConnectable={false} nodesDraggable={false}
      minZoom={0.3} maxZoom={2}
      style={{ background: "transparent" }}>
      <Background variant={BackgroundVariant.Dots} gap={24} size={0.8} color="rgba(255,255,255,0.04)" />
    </ReactFlow>
  );
}