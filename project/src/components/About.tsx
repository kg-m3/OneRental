import React from 'react';

// const About = () => {
//   return (
//     <section id="about" className="py-20 bg-white">
//       <div className="container mx-auto px-4">
//         {/* Section Heading */}
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Who We Are</h2>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             We are a digital platform dedicated to bridging the gap between heavy-duty construction
//             machinery owners and those who need reliable equipment for their projects.
//           </p>
//         </div>

//         {/* Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//           {/* Left Column - Images & Quote */}
//           <div className="space-y-8">
//             {/* First Image */}
//             <div className="relative h-80 rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
//               <img
//                 src="https://images.pexels.com/photos/2760241/pexels-photo-2760241.jpeg?auto=compress&cs=tinysrgb&w=1600"
//                 alt="Construction crane"
//                 className="w-full h-full object-cover"
//               />
//               {/* Quote */}
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
//                 <blockquote className="text-white italic text-lg">
//                   "When machines are idle, opportunities are missed. We're changing that."
//                   <footer className="text-yellow-400 text-sm mt-2">— Platform Vision</footer>
//                 </blockquote>
//               </div>
//             </div>

//             {/* Second Image */}
//             <div className="h-60 rounded-xl overflow-hidden shadow-xl transform transition-transform duration-500 hover:scale-[1.02]">
//               <img
//                 src="https://images.pexels.com/photos/2760344/pexels-photo-2760344.jpeg?auto=compress&cs=tinysrgb&w=1600"
//                 alt="Machinery working"
//                 className="w-full h-full object-cover"
//               />
//             </div>
//           </div>

//           {/* Right Column - Text Content */}
//           <div className="space-y-6">
//             <h3 className="text-2xl font-bold text-gray-800">Redefining Equipment Access in Construction</h3>

//             <p className="text-gray-600">
//               In South Africa's fast-paced construction space, access to the right machinery can make or break a project.
//               But far too often, valuable equipment sits unused while contractors scramble to find reliable rentals.
//             </p>

//             <p className="text-gray-600">
//               Our platform was created to change that. We connect equipment owners—who are often small businesses—with those
//               who need machinery on demand. The result? More projects completed on time, fewer delays, and better income
//               streams for local operators.
//             </p>

//             <p className="text-gray-600">
//               This isn't just about rentals—it's about building a network that empowers builders, improves resource
//               efficiency, and drives progress in the construction industry. Whether you're lifting, digging, grading,
//               or hauling, we're here to help you get the job done.
//             </p>

//             <div className="pt-4">
//               <a
//                 href="#how-it-works"
//                 className="inline-flex items-center text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
//               >
//                 Learn how our platform works
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                 </svg>
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default About;
const About = () => {
  return (
    <div className="wrapper">
      {/* Who We Are Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto py-20 px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6">
            Who We Are
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-12">
            We are a digital platform dedicated to bridging the gap between
            heavy-duty machinery owners and those who need reliable
            equipment for their projects. From contractors and
            companies to individuals tackling large-scale tasks, we make it easy
            to access the right machinery—when and where it's needed.
          </p>
        </div>

        {/* Story Section */}
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Images + Quote */}
          <div className="space-y-6">
            <div
              className="relative h-80 bottom-16 rounded-xl overflow-hidden shadow-2xl bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29uc3RydWN0aW9ufGVufDB8fDB8fHww.jpg?auto=compress&cs=tinysrgb&w=1600')",
              }}
            >
              {/* <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
                <p className="italic text-lg">
                  "When machines are idle, opportunities are missed. We’re
                  changing that."
                </p>
                <p className="text-yellow-400 text-sm mt-2">
                  — Platform Vision
                </p>
              </div> */}
            </div>

            <div className="relative  bottom-8 right-0 p-4">
              <p className="italic text-lg text-blue-800">
                "When machines are idle, opportunities are missed. We’re
                changing that."
              </p>
              <p className="text-gray-900 text-sm mt-2">— OneRental Vision</p>
            </div>
            <div
              className="h-60 rounded-xl overflow-hidden shadow-xl bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJ1bGxkb3plcnxlbnwwfHwwfHx8MA%3D%3D.jpeg?auto=compress&cs=tinysrgb&w=1600')",
              }}
            ></div>
          </div>

          {/* Right: Text */}
          <div className="space-y-6">
            <div
              className="relative top-20 h-60 mb-24 rounded-xl overflow-hidden shadow-xl bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/2760344/pexels-photo-2760344.jpeg?auto=compress&cs=tinysrgb&w=1600')",
              }}
            ></div>

            <h3 className="text-2xl font-bold text-blue-800">
              Redefining Equipment Access Across Industries
            </h3>
            <p className="text-gray-600">
              In today’s fast-moving industries, from agriculture to logistics and
              infrastructure, access to the right equipment can determine the success
              of a project. Yet too often, valuable machinery remains idle while businesses
              struggle to secure reliable rentals.
            </p>
            <p className="text-gray-600">
              Our platform was built to solve this challenge. We connect equipment
              owners—many of whom are small and medium enterprises—with businesses
              and individuals who need machinery on demand. The result? Increased
              uptime, reduced project delays, and new income opportunities for local operators.
            </p>
            <p className="text-gray-600">
              This isn’t just about rentals—it’s about creating a connected 
              ecosystem that empowers businesses, optimizes resources, and drives
              progress across sectors.
            </p>
            <div>
              <a
                href="#how-it-works"
                className="inline-flex items-center text-gray-900 font-semibold hover:text-gray-600 transition-colors"
              >
                Learn how our platform works
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
