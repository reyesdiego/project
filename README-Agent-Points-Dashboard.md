# Agent Points Dashboard

## Overview

The Agent Points Dashboard is a new individual dashboard that provides a comprehensive view of points accumulated by each agent across the entire history of the system. This dashboard is designed to give a clear visual representation of agent performance and ranking.

## Features

### 📊 Statistics Cards
- **Total de Agentes**: Shows the total number of agents in the system
- **Puntos Totales**: Displays the sum of all points across all agents
- **Promedio por Agente**: Shows the average points per agent
- **Agentes Activos**: Count of agents who have received at least one score

### 🏆 Top Agent Highlight
A special highlighted section that showcases the agent with the highest total points, including:
- Agent name
- Total points achieved
- Visual trophy indicator

### 📈 Interactive Bar Chart
- **Responsive Design**: Adapts to different screen sizes
- **Color-coded Bars**: Each agent has a unique color for easy identification
- **Custom Tooltips**: Hover over bars to see detailed information
- **Sorted by Performance**: Agents are automatically sorted by total points (highest to lowest)
- **Formatted Numbers**: Large numbers are formatted with commas for readability
- **Fullscreen Mode**: Toggle fullscreen for immersive viewing experience

### 📋 Detailed Agent List
A comprehensive table showing:
- **Position**: Ranking based on total points
- **Agent Name**: Full name of the agent
- **Total Points**: Accumulated points across all evaluations
- **Evaluations**: Number of times the agent has been evaluated
- **Average**: Average points per evaluation

## Access

The dashboard is accessible via:
- **URL**: `/agent-points`
- **Navigation**: "Puntos por Agente" in the sidebar
- **Permissions**: Available to all user roles (admin, evaluador, visualizador)

## Data Source

The dashboard fetches data from:
- **Agents Table**: Active agents with their basic information
- **Scores Table**: All historical scores with their associated point values
- **Score Types Table**: Point values for each score type

## Technical Implementation

### Components
- **AgentPointsDashboardPage**: Main dashboard component
- **Redux Slice**: `agentPointsSlice` for state management
- **API Integration**: RESTful API calls to Express.js backend for optimal performance

### Key Features
- **Real-time Data**: Fetches fresh data on each page load
- **Error Handling**: Graceful error states with user-friendly messages
- **Loading States**: Smooth loading animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Fully compatible with the application's theme system
- **Fullscreen Mode**: Immersive viewing experience with keyboard shortcuts

## Usage

1. Navigate to the "Puntos por Agente" section in the sidebar
2. View the overview statistics at the top
3. See the top-performing agent highlighted
4. Analyze the bar chart to compare agent performance
5. Review the detailed table for specific metrics
6. Use the fullscreen button for an immersive viewing experience
7. Press ESC key to exit fullscreen mode

## Benefits

- **Performance Tracking**: Easy identification of top and bottom performers
- **Historical Analysis**: Complete view of all-time performance
- **Competitive Insights**: Clear ranking system for motivation
- **Data Transparency**: Comprehensive view of evaluation history
- **Decision Support**: Helps in identifying training needs and recognition opportunities
