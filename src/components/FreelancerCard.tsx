
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FreelancerCardProps {
  freelancer: {
    id: string;
    name: string;
    age: number;
    region: string;
    experiences: string[];
    photo: string;
    email: string;
    phone: string;
    gender: string;
  };
  onContact: (freelancer: any) => void;
}

const FreelancerCard = ({ freelancer, onContact }: FreelancerCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="flex-shrink-0">
          <img
            src={freelancer.photo}
            alt={freelancer.name}
            className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0"
          />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{freelancer.name}</h3>
            <div className="flex items-center text-gray-600 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">{freelancer.age} anos</span>
              <span className="mx-2">•</span>
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{freelancer.region}</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Experiências:</h4>
            <div className="flex flex-wrap gap-2">
              {freelancer.experiences.map((exp, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4">
            <div className="flex space-x-4 text-sm text-gray-600 mb-3 sm:mb-0">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {freelancer.phone}
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {freelancer.email}
              </div>
            </div>
            
            <Button
              onClick={() => onContact(freelancer)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Entrar em Contato
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerCard;
