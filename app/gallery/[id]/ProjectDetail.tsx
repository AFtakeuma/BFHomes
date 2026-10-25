'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  categoryLabel,
  getGalleryProjectById,
  getSimilarProjects,
} from '../../lib/gallery';

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const project = useMemo(() => getGalleryProjectById(parseInt(projectId, 10)), [projectId]);
  const similarProjects = useMemo(() => (project ? getSimilarProjects(project) : []), [project]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('お問い合わせを受け付けました。担当者よりご連絡いたします。');
    setShowContactForm(false);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">事例が見つかりません</h2>
          <Link href="/gallery" className="text-teal-600 hover:text-teal-700 font-semibold">
            ギャラリーに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="text-lg sm:text-2xl font-pacifico text-white">
              Before-After Homes
            </Link>
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/gallery" className="text-white font-semibold">ギャラリー</Link>
              <Link href="/contact" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
                お問い合わせ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <nav className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">ホーム</Link>
            <i className="ri-arrow-right-s-line text-gray-400" />
            <Link href="/gallery" className="text-gray-500 hover:text-gray-700">ギャラリー</Link>
            <i className="ri-arrow-right-s-line text-gray-400" />
            <span className="text-gray-900 font-medium line-clamp-1">{project.title}</span>
          </div>
        </div>
      </nav>

      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="relative">
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-semibold z-10 shadow-lg">
                BEFORE
              </div>
              <img
                src={project.before}
                alt={`${project.title}（施工前）`}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover object-top rounded-2xl shadow-xl"
              />
            </div>
            <div className="relative">
              <div className="absolute top-4 left-4 bg-teal-600 text-white px-4 py-2 rounded-full text-lg font-semibold z-10 shadow-lg">
                AFTER
              </div>
              <img
                src={project.after}
                alt={`${project.title}（施工後）`}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover object-top rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                <p className="text-sm text-teal-700 font-medium mb-2">{categoryLabel(project.category)}</p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {project.title}
                </h1>
                {project.date && (
                  <p className="text-gray-500 mb-6">掲載: {project.date}</p>
                )}
                <p className="text-gray-700 text-lg leading-relaxed">{project.description}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-bold mb-6">行った作業内容</h2>
                <ul className="space-y-3">
                  {project.workItems.map((item) => (
                    <li key={item} className="flex items-start space-x-3">
                      <i className="ri-checkbox-circle-line text-teal-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <h3 className="text-xl font-bold mb-4">この事例で相談する</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  同様の修繕をご検討の方は、お気軽にお問い合わせください。
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700"
                  >
                    この事例で相談する
                  </button>
                  <Link
                    href="/contact"
                    className="block w-full border-2 border-teal-600 text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 text-center"
                  >
                    お問い合わせフォームへ
                  </Link>
                </div>
              </div>

              {similarProjects.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h4 className="text-lg font-semibold mb-4">同じ部位の事例</h4>
                  <div className="space-y-4">
                    {similarProjects.map((similar) => (
                      <Link
                        key={similar.id}
                        href={`/gallery/${similar.id}`}
                        className="block border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <img
                          src={similar.after}
                          alt={similar.title}
                          className="w-full h-24 object-cover object-top rounded-lg mb-3"
                        />
                        <h5 className="font-semibold text-sm line-clamp-2">{similar.title}</h5>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showContactForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">この事例で相談する</h2>
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                aria-label="閉じる"
              >
                <i className="ri-close-line text-xl text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">お名前 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ご質問・ご要望</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder={`「${project.title}」と同様の修繕を検討しています…`}
                />
              </div>
              <button type="submit" className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700">
                送信する
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
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
