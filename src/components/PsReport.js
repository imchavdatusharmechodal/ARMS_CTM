import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Signature_img from "../Image/Signature.jpg";

function PsReport() {
    const { applicationId } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        console.log("API calling for applicationId:", applicationId);
        const fetchReport = async () => {
            const token = localStorage.getItem('authToken');
            //  const applicationId = 3;
            if (!token || !applicationId) return;
            try {
                const response = await fetch(
                    `https://lampserver.uppolice.co.in/validation-report/ps/${applicationId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                const data = await response.json();
                console.log('API response:', data); 
                if (data.status && data.data) {
                    // Map API fields to UI fields
                    setApplication({
                        applicant_name: data.data.applicant_name,
                        father_or_spouse_name: data.data.father_spouse_name,
                        present_address: data.data.current_address,
                        nearest_police_station: data.data.nearest_police_station,
                        convicted: data.data.ever_convicted === "हाँ",
                        conviction_details: data.data.conviction_details || "उपलब्ध नहीं",
                        bond_ordered: data.data.dp_act_applied === "हाँ",
                        bond_details: data.data.dp_act_details || "उपलब्ध नहीं",
                        prohibited_under_arms_act: data.data.arms_act_applied === "हाँ",
                        prohibition_details_extra: data.data.arms_act_details || "उपलब्ध नहीं",
                        enmity_or_dispute: data.data.has_enemy === "हाँ",
                        dispute_details: data.data.enemy_details || "उपलब्ध नहीं",
                        address_and_dob_verified: data.data.address_verified === "हाँ",
                        address_and_dob_details: data.data.address_verification_details || "उपलब्ध नहीं",
                        occupation_verified: data.data.business_verified === "हाँ",
                        occupation_details: data.data.business_verification_details || "उपलब्ध नहीं",
                        complaint_registered: data.data.complaint_registered === "हाँ",
                        complaint_details: data.data.complaint_details || "उपलब्ध नहीं",
                        crime_involved: data.data.involved_in_crime === "हाँ",
                        crime_details: data.data.crime_details || "उपलब्ध नहीं",
                        arrested: data.data.ever_arrested === "हाँ",
                        arrest_details: data.data.arrest_details || "उपलब्ध नहीं",
                        bad_character_register: data.data.bad_character_register === "हाँ",
                        bad_character_details: data.data.bad_character_details || "उपलब्ध नहीं",
                        other_department_case: data.data.govt_case_registered === "हाँ",
                        other_department_details: data.data.govt_case_details || "उपलब्ध नहीं",
                        death_threat_complaint: data.data.life_threat === "हाँ",
                        death_threat_details: data.data.life_threat_details || "उपलब्ध नहीं",
                        political_communal_organization: data.data.political_organization_details || "उपलब्ध नहीं",
                        date: data.data.report_date,
                        seal: "आधिकारिक मोहर",
                        signature_url: data.data.signature_path
                            ? `https://lampserver.uppolice.co.in${data.data.signature_path}`
                            : "",
                        police_incharge: data.data.police_station_incharge || "उपलब्ध नहीं",
                        police_station: data.data.police_station_name || "उपलब्ध नहीं",
                         assigned_by: data.data.assigned_by || "N/A"
                    });
                } else {
                    setApplication(null);
                }
            } catch {
                setApplication(null);
            }finally {
                setLoading(false); // Always stop loading
            }
        };
        fetchReport();
    }, [applicationId]);

    if (!application) {
        return <div className='container py-4 text-center'>Loading...</div>;
    }

    return (
        <div className='container-fluid py-4'>
            <style>
                {`
                    .custom-table th, .custom-table td {
                        width: 33.33%;
                    }
                    .custom-table td[colspan="2"] {
                        width: 33.33%;
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
                        <h3 className="mb-2">पूर्ववर्ती सत्यापन रिपोर्ट</h3>
                        <h4>(पुलिस विभाग द्वारा भरा जाएगा)</h4>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='table-responsive mt-table'>
                        <table className="table table-bordered custom-table" aria-label="Police Validation Report">
                            <tbody>
                                <tr>
                                    <th className='tble-pdf-center' scope="col" colSpan={3}>VALIDATION REPORT</th>
                                </tr>
                                <tr>
                                    <th scope="col">1. आवेदक का नाम</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.applicant_name}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="col">2. पिता/पति-पत्नी का नाम</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.father_or_spouse_name}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>3. वर्तमान पता</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.present_address}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>वर्तमान पता का नजदीक पुलिस थाना</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.nearest_police_station}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>4. क्या आवेदक कभी दोषसिद्ध हुआ है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.convicted ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>(क) यदि हां, अपराध, दंडादेश और दंडादेश की तारीख</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.conviction_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>(ख) शांति बनाए रखने या सदाचार के लिए दंड प्रक्रिया संहिता, 1973 (1974 का 2) के अध्याय 7 के अधीन बंध पत्र के निष्पादन का आदेश किया गया है।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.bond_ordered ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, तो कब और उसकी अवधि क्या है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.bond_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>(ग) किसी अपराध या गोलाबारूद उसके पास या ले जाने में अर्जन किए जाने से आयुध अधिनियम, 1959 या किसी अन्य विधि के अधीन निषिद्ध किया गया है।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.prohibited_under_arms_act ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, उसका ब्यौरा क्या है।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.prohibition_details_extra}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>5. क्या आवेदक का किसी से शत्रुता या झगड़ा है जिससे शांति भंग होने की संभावना है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.enmity_or_dispute ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, ब्यौरा दीजिए।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.dispute_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>6. क्या आवेदक का पता और जन्म तारीख का सत्यापन किया गया है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.address_and_dob_verified ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>ब्यौरा दीजिए।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.address_and_dob_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>7. क्या आवेदक का व्यवसाय/कारबार का सत्यापन किया गया है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.occupation_verified ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>ब्यौरा दीजिए।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.occupation_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>8. क्या पुलिस थाने में आवेदक के विरूद्ध कोई शिकायत रजिस्टर्ड है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.complaint_registered ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, उसका ब्यौरा क्या है।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.complaint_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>9. क्या आवेदक किसी अपराध में संलिप्त रहा है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.crime_involved ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, उसका ब्यौरा क्या है।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.crime_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>10. क्या आवेदक किसी अपराध में गिरफ्तार हुआ था?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.arrested ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, उसका ब्यौरा क्या है।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.arrest_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>11. क्या आवेदक का नाम पुलिस थाने के खराब चरित्र रजिस्टर में सूचीबद्ध है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.bad_character_register ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, पुलिस थाने के अभिलेख के अनुसार ब्यौरा दीजिए।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.bad_character_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>12. क्या आवेदक का नाम भारत सरकार के अन्य विभाग जैसे- सीबीआई, स्वापक नियंत्रण ब्योरो, डीआरआई, प्रवर्तन निदेशालय आदि द्वारा किसी मामले में रजिस्टर्ड किया गया है जिसमें पुलिस थाने के दैनिक डायरी रजिस्टर, समन, वारंट आदि में वर्णित पाया गया है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.other_department_case ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, ब्यौरा दीजिए।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.other_department_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>13. क्या आवेदक ने पुलिस थाने में जान से मारने की धमकी के संबंध में कोई शिकायत रजिस्टर्ड कराई है?</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.death_threat_complaint ? "हाँ" : "नहीं"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>यदि हाँ, ब्यौरा दीजिए।</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.death_threat_details}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>14. किसी राजनीतिक या साम्प्रदायिक संगठन जिसमें आवेदक सदस्य है का ब्यौरा</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.political_communal_organization}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td scope="col" colSpan={3}>प्रमाणित किया जाता है कि मैंने आवेदक द्वारा जमा किए गए आयुध अनुज्ञप्ति दान करने के लिए आवेदन प्ररूप की विषय-वस्तुओं को चैक कर लिया है।</td>
                                </tr>
                                <tr>
                                    <th scope="col">तारीख</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.date?.slice(0, 10).split("-").reverse().join("/") || 'उपलब्ध नहीं'}</span>
                                    </td>
                                </tr>
                                {/* <tr>
                                    <th scope="col">मोहर</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.seal}</span>
                                    </td>
                                </tr> */}
                                {/* <tr>
                                    <th scope="col">थाना प्रभारी</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.police_incharge}</span>
                                    </td>
                                </tr> */}
                                <tr>
                                    <th scope="col">पुलिस थाना</th>
                                    <td scope="col" colSpan={2}>
                                        <span>{application.police_station}</span>
                                    </td>
                                </tr>
                                <tr>
                                <th scope="col">द्वारा सौंपा गया</th>
                                <td scope="col" colSpan={2}>
                                    <span>{application.assigned_by || 'N/A'}</span>
                                </td>
                                </tr>
                                <tr>
                                    <th scope="col">हस्ताक्षर</th>
                                    <td scope="col" colSpan={2}>
                                        <div className='signature-img '>
                                            {application.signature_url ? (
                                                <img src={application.signature_url} alt="Signature" className='signature-img' style={{ maxWidth: '150px' }} />
                                            ) : (
                                                <img src={Signature_img} alt="Signature" className='signature-img' />
                                            )}
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

export default PsReport;