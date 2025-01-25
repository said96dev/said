import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';

const ProjectList: React.FC = () => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const { projects, addProject } = useProjectStore();
  const navigate = useNavigate();

  const handleCreateProject = () => {
    if (projectName.trim()) {
      const newProject = addProject(projectName.trim());
      setProjectName('');
      setShowNewProject(false);
      navigate(`/project/${newProject.id}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">360° Projects</h1>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {showNewProject && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            className="w-full p-2 border rounded-md mb-4"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewProject(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/project/${project.id}`)}
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            <p className="text-gray-500">{project.images.length} images</p>
          </div>
        ))}
      </div>

      {projects.length === 0 && !showNewProject && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No projects yet. Click "New Project" to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProjectList;