'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  GALLERY_CATEGORIES,
  getGalleryProjects,
  type GalleryCategory,
  type GalleryProject,
  categoryLabel,
} from '../lib/gallery';

const allProjects = getGalleryProjects();

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<GalleryProject | null>(null);

  const filteredProjects = useMemo(
    () =>
      selectedCategory === 'all'
        ? allProjects
        : allProjects.filter((project) => project.category === selectedCategory),
    [selectedCategory]
  );

  const featuredProjects = useMemo(() => allProjects.filter((p) => p.featured), []);

  const openModal = (project: GalleryProject) => {
    setSelectedProject(project);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };

  const renderCard = (project: GalleryProject, compact = false) => (
    <div
      key={project.id}
      onClick={() => openModal(project)}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      <div className="relative">
        {project.featured && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
            注目
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 p-4">
          <div className="relative">
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
              BEFORE
            </div>
            <img
              src={project.before}
              alt={`${project.title}（施工前）`}
              className={`w-full ${compact ? 'h-24' : 'h-32'} object-cover object-top rounded-lg group-hover:scale-105 transition-transform duration-300`}
            />
          </div>
          <div className="relative">
            <div className="absolute top-2 left-2 bg-teal-600 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
              AFTER
            </div>
            <img
              src={project.after}
              alt={`${project.title}（施工後）`}
              className={`w-full ${compact ? 'h-24' : 'h-32'} object-cover object-top rounded-lg group-hover:scale-105 transition-transform duration-300`}
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs text-teal-700 font-medium mb-2">{categoryLabel(project.category)}</p>
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{project.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description}</p>
        {project.date && <p className="text-sm text-gray-500 mb-4">掲載: {project.date}</p>}
        <button
          type="button"
          className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 whitespace-nowrap"
        >
          詳細を見る
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="ギャラリー" />

      <section className="relative py-16 lg:py-24 bg-gray-50">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url('/images/real/hero-living-after.jpg')` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            施工事例
            <span className="block text-teal-600">ギャラリー</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-4 leading-relaxed max-w-3xl mx-auto">
            旧サイト（WordPress）掲載の実施工写真 {allProjects.length} 件を掲載しています
          </p>
          <p className="text-base text-gray-500">Before と After を比較してご覧ください</p>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">注目の事例</h2>
            <p className="text-lg text-gray-600">リビング・キッチン・浴室の代表的な施工例</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => renderCard(project, true))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">部位別事例</h2>
            <p className="text-lg text-gray-600">施工箇所から事例を絞り込めます</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {GALLERY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <i className={`${category.icon} text-lg`} />
                  <span>{category.name}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => renderCard(project))}
          </div>
        </div>
      </section>

      {modalOpen && selectedProject && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-modal-title"
          >
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm text-teal-700 font-medium mb-2">
                    {categoryLabel(selectedProject.category)}
                  </p>
                  <h2 id="gallery-modal-title" className="text-2xl lg:text-3xl font-bold text-gray-900 pr-4 leading-tight">
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer flex-shrink-0"
                  aria-label="閉じる"
                >
                  <i className="ri-close-line text-xl text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="relative">
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-semibold z-10 shadow-lg">
                    BEFORE
                  </div>
                  <img
                    src={selectedProject.before}
                    alt={`${selectedProject.title}（施工前）`}
                    className="w-full h-64 lg:h-80 xl:h-96 object-cover object-top rounded-2xl shadow-lg"
                  />
                </div>
                <div className="relative">
                  <div className="absolute top-4 left-4 bg-teal-600 text-white px-4 py-2 rounded-full text-lg font-semibold z-10 shadow-lg">
                    AFTER
                  </div>
                  <img
                    src={selectedProject.after}
                    alt={`${selectedProject.title}（施工後）`}
                    className="w-full h-64 lg:h-80 xl:h-96 object-cover object-top rounded-2xl shadow-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">作業内容</h3>
                  <ul className="space-y-2 mb-6">
                    {selectedProject.workItems.map((item) => (
                      <li key={item} className="flex items-start space-x-2 text-gray-700">
                        <i className="ri-checkbox-circle-line text-teal-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {selectedProject.date && (
                    <p className="text-sm text-gray-500">掲載: {selectedProject.date}</p>
                  )}
                </div>
                <div className="space-y-4">
                  <Link
                    href={`/gallery/${selectedProject.id}`}
                    className="block w-full bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-all duration-200 text-center"
                  >
                    詳細ページを見る
                  </Link>
                  <Link
                    href="/contact"
                    className="block w-full bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-all duration-200 text-center"
                  >
                    この事例で相談する
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="py-16 lg:py-24 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            気になる事例は見つかりましたか？
          </h2>
          <p className="text-xl lg:text-2xl mb-12 opacity-90 leading-relaxed">
            同様の修繕・リノベーションのご相談はお気軽にお問い合わせください
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-teal-600 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg"
          >
            無料相談を申し込む
          </Link>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
