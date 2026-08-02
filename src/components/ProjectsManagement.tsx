import React, { useState } from 'react';
import { ProjectsList } from './ProjectsList';
import { ProjectView } from './ProjectView';
import { ProjectForm } from './ProjectForm';
import { Project } from '../types/project';

type ViewMode = 'list' | 'view' | 'edit' | 'add';

export const ProjectsManagement: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const handleViewProject = (project: Project) => {
        setSelectedProject(project);
        setViewMode('view');
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project);
        setViewMode('edit');
    };

    const handleAddProject = () => {
        setSelectedProject(null);
        setViewMode('add');
    };

    const handleBackToList = () => {
        setSelectedProject(null);
        setViewMode('list');
    };

    const handleProjectDeleted = () => {
        setSelectedProject(null);
        setViewMode('list');
    };

    const handleProjectUpdated = (updatedProject: Project) => {
        setSelectedProject(updatedProject);
        setViewMode('view');
    };

    const handleProjectCreated = () => {
        setSelectedProject(null);
        setViewMode('list');
    };

    switch (viewMode) {
        case 'view':
            return selectedProject ? (
                <ProjectView
                    projectId={selectedProject._id}
                    onBack={handleBackToList}
                    onEdit={handleEditProject}
                    onDelete={handleProjectDeleted}
                />
            ) : (
                <ProjectsList
                    onViewProject={handleViewProject}
                    onEditProject={handleEditProject}
                />
            );

        case 'edit':
            return selectedProject ? (
                <ProjectForm
                    project={selectedProject}
                    onSave={handleProjectUpdated}
                    onCancel={handleBackToList}
                    mode="edit"
                />
            ) : (
                <ProjectsList
                    onViewProject={handleViewProject}
                    onEditProject={handleEditProject}
                />
            );

        case 'add':
            return (
                <ProjectForm
                    onSave={handleProjectCreated}
                    onCancel={handleBackToList}
                    mode="add"
                />
            );

        default:
            return (
                <ProjectsList
                    onViewProject={handleViewProject}
                    onEditProject={handleEditProject}
                />
            );
    }
};
