import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Signature_img from "../Image/Signature.jpg";
import axios from 'axios';

function SdmReport() {
  const { id } = useParams(); // Get application ID from URL
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
   const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(
          `https://lampserver.uppolice.co.in/validation-report/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.status && response.data.data) {
          setApplication(response.data.data);
          console.log("API RESPONSE:", response.data.data);
        } else {
          setError("No report found.");
        }
      } catch (err) {
        setError("Failed to fetch validation report.");
      }
    };
    fetchReport();
  }, [id, token]);

  if (error) {
    return <div className="container py-4 text-center text-danger">{error}</div>;
  }

  if (!application) {
    return <div className="container py-4 text-center">Loading...</div>;
  }

  // Helper for file URLs
const fileUrl = (url) =>
  url && url.startsWith("/") ? `https://lampserver.uppolice.co.in${url}` : url;


  if (error) {
    return <div className="container py-4 text-center text-danger">{error}</div>;
  }

  if (!application) {
    return <div className="container py-4 text-center">Loading...</div>;
  }



  return (
    <div className='container-fluid py-4'>
      <style>
        {`
          
          .custom-table th, .custom-table td {
            width: 43.33%;
            word-wrap: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .custom-table td[colspan="2"] {
            width: 35.33%; /* Adjust for colSpan=2 */
          }
         
          @media print {
            .no-print {
              display: none;
            }
           
          }
        `}
      </style>
      <div className='row'>
        <div className='col-12 mb-4 text-end'>
          <button className='btn btn-verify no-print' onClick={() => window.print()}>
            Print PDF
          </button>
        </div>
        <div className='col-12'>
          <div className='pdf-text text-center'>
            <h3 className="mb-2">अनुज्ञप्ति दिये जाने के आवेदन पत्र पर तहसीलदार की जांच आख्या का प्रारूप</h3>
            <h4>(आख्या प्रत्येक कर्मचारी / अधिकारी के स्पष्ट हस्ताक्षर, नाम एवं पदनाम क मोहर सहित अंकित की जाये)</h4>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-12'>
          <div className='table-responsive mt-table'>
            <table className="table table-bordered custom-table" aria-label="Application Validation Report">
              <tbody>
                <tr>
                  <th className='tble-pdf-center' scope="col" colSpan={3}>VALIDATION REPORT</th>
                </tr>
                <tr>
                  <th scope="col">1. आवेदक का नाम</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.applicant_name || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th scope="col">2. पिता/पति-पत्नी का नाम</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.father_or_spouse_name || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th scope="col">3. आवेदक की आयु</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.age || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th scope="col">2. आवेदक की जाति (जाति प्रमाण पत्र संलग्न किया जाये)</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.caste || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th rowSpan={2}>4. आवेदक शारीरिक रूप से विकलांग / अक्षम तो नहीं है, <br />यदि हाँ तो संक्षिप्त विवरण अंकित किया जाये।</th>
                  <td colSpan={2}>
                    <span>{application.is_physically_disabled ? 'हाँ' : 'नहीं'}</span>
                  </td>
                </tr>
                <tr>
                  <td scope="col" colSpan={2}>
                    <span>{application.disability_details || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>3. आवेदक का पेशा / व्यवसाय</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.occupation || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th colSpan={3}>आवेदक की वार्षिक आय (आय प्रमाण-पत्र संलग्न) पैन नं0</th>
                </tr>
                <tr>
                  <th>आयकर विभाग में दाखिल गत तीन वर्षों की रिटर्न अथवा फार्म-16 की प्रति संलग्न की जाये</th>
                  <td scope="col" colSpan={2}>
                    <span>
                      {application.income_tax_return_url ? (
        <a href={fileUrl(application.income_tax_return_url)} target="_blank" rel="noopener noreferrer">
          <img src={fileUrl(application.income_tax_return_url)} alt="Income Tax Return" style={{maxWidth: "120px"}} />
          <br />View File
        </a>
      ) : 'N/A'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक का पता</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.address || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>स्थायी निवास का पूरा पता (थाना सहित)</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.permanent_address || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>वर्तमान निवास का पूरा पता (थाना सहित)</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.current_address || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th rowSpan={2}>आवेदक वर्तमान पते पर कब से निवास कर रहा है। <br />(पुष्टि के अभिलेखीय साक्ष्य एवं निवास प्रमाण-पत्र संलग्न किया जायें)</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.residence_duration || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <td scope="col" colSpan={2}>
                    <span>
                      {application.residence_proof_url ? (
        <a href={fileUrl(application.residence_proof_url)} target="_blank" rel="noopener noreferrer">
          <img src={fileUrl(application.residence_proof_url)} alt="Residence Proof" style={{maxWidth: "120px"}} />
          <br />View File
        </a>
      ) : 'N/A'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक ने अब से पूर्व किस-किस थाना क्षेत्र / जनपद / राज्य में निवास किया है, का पूर्ण विवरण</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.previous_residences || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>निवास का पूर्ण / डाकीय पता</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.postal_address || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>निवास की अवधि कब से कब तक</th>
                  <td scope="col" colSpan={2}>
                    <span>
                      {application.residence_start_date?.slice(0, 10).split("-").reverse().join("/") || 'N/A'} - 
                      {application.residence_end_date?.slice(0, 10).split("-").reverse().join("/") || 'N/A'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>थाना क्षेत्र</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.police_station_area || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>जनपद</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.district || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th colSpan={3}>आवेदक के पारिवारिक एवं आश्रित सदस्यों का विवरण</th>
                </tr>
                <tr>
                  <th>बालिग</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.adult_members || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>नाबालिग</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.minor_members || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>कुल सदस्य</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.total_members || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक व उसके परिवार की आम छवि</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.family_reputation || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th colSpan={3}>आवेदक / उसके परिवार के सदस्यों के विरूद्ध सरकारी धन बकाया के सम्बन्ध में आख्या</th>
                </tr>
                <tr>
                  <th>(1) तहसील स्तरीय क्षेत्रीय अमीन की आख्या</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.tehsil_amin_report || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>(2) वाणिज्य कर अमीन की आख्या</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.commercial_tax_report || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>(3) संग्रह अनुभाग के प्रभारी की आख्या</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.collection_section_report || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक /परिवार के सदस्यो ने सरकारी/ग्राम समाज की भूमि पर कब्जा/कब्जे में सहयोग तो नहीं किया है?</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.land_encroachment || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक उसके परिवार के सदस्यो का कोई भूमि विवाद न्यायालय में चल रहा है अथवा नहीं?</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.land_dispute || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक द्वारा प्रशासनिक कार्यों में सहयोग की स्थिति?</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.admin_cooperation || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>अल्प बचत में योगदान?</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.savings_contribution || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>परिवार नियोजन में योगदान की स्थिति (कितने बच्चे हैं?)</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.family_planning || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>उत्तराधिकारी प्रकरणों में प्रार्थी के पक्ष में अनुज्ञा-पत्र जारी करने में उत्तराधिकारीयों में कोई विवाद तो नहीं है, यदि कोई विवाद है तो उसका संक्षिप्त विवरण अंकित करें।</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.succession_dispute || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक को शस्त्र लाईसेंस की वास्तविक आवश्यकता का कारण अंकित किया जाये।</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.weapon_license_reason || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक को शस्त्र लाईसेंस स्वीकृत किये जाने अथवा स्वीकृत न किये जाने के सम्बन्ध में क्षेत्रीय नायव तहसीलदार का स्पष्ट मतः-</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.naib_tehsildar_opinion || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक को शस्त्र लाईसेंस स्वीकृत कiye जाने अथवा स्वीकृत न कiye जाने के सम्बन्ध में तहसीलदार अपने मत का स्पष्ट उल्लेख करें:-</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.tehsildar_opinion || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th>आवेदक को शस्त्र लाईसेंस स्वीकृत कiye जाने अथवा स्वीकृत न किया जाने सम्बन्ध में उप जिला मजिस्ट्रेट आवेदक का व्यक्तिगत रूप से साक्षात्कार लेने के उपरांत तहसील की उपर्युक्त आख्या का परीक्षण कर अपने मत का स्पष्ट उल्लेख करें:-</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.sdm_opinion || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th colSpan={3}>नोट: आवेदन-पत्र अस्वीकृत कiye जाने की संस्तुति कiye जाने पर उसके कारण का स्पष्ट उल्लेख अवश्य किया जाये</th>
                  {/* <td scope="col" colSpan={2}>
                    <span>{application.rejection_reason || 'N/A'}</span>
                  </td> */}
                </tr>
                <tr>
                  <th scope="col">तारीख</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.report_date
                ? application.report_date.slice(0, 10).split("-").reverse().join("/")
                : 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th scope="col">द्वारा सौंपा गया</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.assigned_by || 'N/A'}</span>
                  </td>
                </tr>
                {/* <tr>
                  <th scope="col">थाना प्रभारी</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.police_incharge || 'N/A'}</span>
                  </td>
                </tr> */}
                <tr>
                  <th scope="col">पुलिस थाना</th>
                  <td scope="col" colSpan={2}>
                    <span>{application.police_station || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <th scope="col">हस्ताक्षर</th>
                  <td scope="col" colSpan={2}>
                    <div className='signature-img'>
                      <img
                      src={application.signature_url ? fileUrl(application.signature_url) : Signature_img}
                      alt="Official Signature"
                      className='signature-img'
                      style={{maxWidth: "120px"}}
                    />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SdmReport;