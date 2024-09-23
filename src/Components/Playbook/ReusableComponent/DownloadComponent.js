// // DownloadComponent.js
// import React from 'react';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// const DownloadComponent = ({ tableData }) => {
//   const handleDownload = () => {
//     const doc = new jsPDF();

//     // Add table content using jsPDF autoTable plugin
//     doc.autoTable({
//       head: [['File Name', 'Transcription']],
//       body: tableData.map((file) => [
//         file.name,
//         file.transcription || 'No transcription available',
//       ]),
//     });

//     // Save the PDF
//     doc.save('transcriptions.pdf');
//   };

//   return (
//     <button 
//       onClick={handleDownload} 
//       className="bg-yellow-500 text-white px-4 py-2 rounded">
//       Download PDF
//     </button>
//   );
// };

// export default DownloadComponent;
// DownloadComponent.js
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowDown } from '@fortawesome/free-solid-svg-icons';

const DownloadComponent = ({ fileName = 'download', headers = [], data = [] }) => {
  
  const handleDownload = () => {
    const doc = new jsPDF();

    // Create table structure with dynamic headers and data
    doc.autoTable({
      head: [headers],
      body: data,
    });

    // Save the PDF with the provided filename
    doc.save(`${fileName}.pdf`);
  };

  return (
    <button 
      onClick={handleDownload} 
      className=" text-white  rounded animate-bounce">
        <FontAwesomeIcon icon={faCircleArrowDown} size='3x' color='blue' />
      {/* Download PDF */}
    </button>
  );
};

export default DownloadComponent;
