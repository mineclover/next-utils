import Image from "next/image";
import Frame from "../../components/Frame";
import dynamic from "next/dynamic";

const DynamicDragVisualization = dynamic(() => import("./DragVisualization"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Next.js 드래그 감지 테스트</h1>
      <DynamicDragVisualization />
    </main>
  );
}
