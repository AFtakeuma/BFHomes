import ProjectDetail from './ProjectDetail';
import { getGalleryProjects } from '../../lib/gallery';

export async function generateStaticParams() {
  return getGalleryProjects().map((p) => ({ id: String(p.id) }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetail projectId={id} />;
}
