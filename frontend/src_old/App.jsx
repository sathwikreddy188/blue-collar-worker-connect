import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FindWorkers from './pages/FindWorkers';
import WorkerProfile from './pages/WorkerProfile';
import PostJob from './pages/PostJob';
import WorkerRegistration from './pages/WorkerRegistration';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import JobDetails from './pages/JobDetails';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Contact from './pages/Contact';
import { PrivacyPolicy, Terms } from './pages/Legal';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-concrete-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/find-workers" element={<FindWorkers />} />
          <Route path="/worker/:id" element={<WorkerProfile />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/become-a-worker" element={<WorkerRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          <Route path="/dashboard/worker" element={<WorkerDashboard />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
