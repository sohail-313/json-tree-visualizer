import JsonTreeVisualizerContent from "@/components/JsonTreeVisualizerContent";
import { ReactFlowProvider } from "@xyflow/react";

export default function Home() {
  return (
    <ReactFlowProvider>
      <JsonTreeVisualizerContent />
    </ReactFlowProvider>
  );
}
