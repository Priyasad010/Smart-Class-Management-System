## PROJECTPROPOSAL 

## GROUPPROJECT 

IIT372-2 

## Group No: IIT 03 **Smart Class Management System** 

Industrial Information Technology 

Department of ComputerScience and Informatics Faculty of Applied Sciences 

Uva Wellassa University of Sri Lanka 

2026 

## **DECLARATION** 

We hereby declare that the project will be developed by us and will be our own effort and that no part will be plagiarized without citations under the supervision of Mr.S.J.M.D.P. Samarakoon (Deepal.s@uwu.ac.lk), Lecturer, Department of Computer Science and Informatics, Uva Wellassa University of Sri Lanka, and Ms.Y.M.A.P.S. Yapa(ymapsyapa@gmail.com), A.R.W.M.M.B.O.Amarakoon(bovindu@gmail.com), Demonstrators, Department of Computer Science and Informatics, Uva Wellassa University of Sri Lanka. This Project Proposal is submitted for the partial fulfilment of the requirement of the course unit IIT 372-2, Project II for the degree of Industrial Information Technology. 

## **Group Details:** 

## Group No: IIT 03 

a No Name of the Student Index Number E-mail Address Signature 2) 1 A.D.K. Sewwandi UWU/IIT/22/016 iit22016@std.uwu.ac.lk a 2 0 I.U. Paranage UWU/IIT/22/046 iit22046@std.uwu.ac.lk a 3 a A.G.P.P. Nandasiri UWU/IIT/22/030 iit22030@std.uwu.ac.lk OY 4 H.M.L.P. Chandrapala UWU/IIT/22/080 iit22080@std.uwu.ac.lk 

## Supervisor Details: 

No Name of the Supervisor Email Contact No 1 Mr. S.J.M.D.P. Samarakoon Deepal.s@uwu.ac.lk 0775248412 No Name of the Co-Supervisor Email Contact No 1 Ms. Y.M.A.P.S. Yapa ymapsyapa@gmail.com 0742660296 2 Mr. A.R.W.M.M.B.O. Amarakoon bovindu@gmail.com 0715553103 

## **Project Approval:** 

…………………………… .…………………… .……………………. Ms. Y.M.A.P.S. Yapa Mr. S.J.M.D.P. Samarakoon A.R.W.M.B.O. Amarakoon Date: 17 May 2026 Date: 17 May 2026 Date: 17 May 2026 

ii 

## **Table of Contents** 

|**Chapter 1: Introduction**................................................................................................**1**|
|---|
|1.1<br>Project Title ...................................................................................................... 1|
|1.2<br>Project Description. ......................................................................................... 1|
|1.3<br>Background and Motivation ............................................................................ 3|
|1.4<br>Problem in Brief ............................................................................................... 4|
|1.5<br>Proposed Solution ............................................................................................ 6|
|1.6<br>Project Aim and Objectives ............................................................................. 9|
|**Chapter 2: Methodology**..............................................................................................**10**|
|2.1 Software Development Methodology .................................................................. 10|
|2.2 Sprint Breakdown ................................................................................................ 12|
|Sprint 1: Core System Architecture and User Management .................................. 12|
|Sprint 2: Smart Attendance and Payment Management System ............................ 13|
|Sprint 3: Smart Study Area and Hall Allocation Management System ................. 14|
|Sprint 4: Examination, Website, Testing, and Final Optimization ......................... 15|
|**Chapter 3: Requirements Identification**....................................................................**16**|
|3.1 Functional Requirements ..................................................................................... 16|
|3.2 Non-Functional Requirements ............................................................................. 20|
|3.3 System Requirements. ......................................................................................... 21|
|3.3.1 Hardware Requirements. .............................................................................. 21|
|3.3.2 Software Requirements ................................................................................. 22|
|3.3.3 Technologies ................................................................................................. 22|
|3.4 User Roles ............................................................................................................ 24|
|**Chapter 4: Project Plan (Gantt chart)**.......................................................................**27**|
|**References**.....................................................................................................................**28**|



iii 

||**Table of Figures**|
|---|---|
|Figure 1: The Agile Scrum Framework… .................................................................. 11|Figure 1: The Agile Scrum Framework… .................................................................. 11|
|Figure 2: The Gantt Chart… ....................................................................................... 27|Figure 2: The Gantt Chart… ....................................................................................... 27|
|Figure 3: System Architecture Diagram. .................................................................... 29|Figure 3: System Architecture Diagram. .................................................................... 29|



iv 

## **Chapter 1: Introduction** 

## **1.1 Project Title** 

Smart Class Management System 

## **1.2 Project Description** 

The proposed system is a web-based Smart Class Management System developed for Thusitha Institute to automate and improve class and institute management activities. The system is designed to manage Grade 1–13 classes and professional courses by integrating student management, attendance tracking, payment handling, class scheduling, study area booking, and institute management activities into a centralized digital platform. 

The proposed solution introduces a Smart Attendance Validation System which combines QR-based attendance marking, classroom occupancy estimation, and conditional face detection using CCTV camera footage. Initially, the system estimates classroom dimensions and calculates the expected student occupancy capacity using CCTV camera calibration and image-processing techniques. During class sessions, students mark attendance using QR-enabled student ID cards while the system estimates the actual number of students physically present inside the classroom using CCTV footage. 

The detected student count is automatically compared with the QR attendance count to identify possible attendance mismatches or proxy attendance situations. If both counts are matched within the acceptable threshold, attendance is considered valid without performing further identity verification. However, if a mismatch is detected between the actual classroom occupancy and recorded attendance, the system activates face detection and student identification processes to identify students who may have marked fake attendance or remained absent after attendance marking. This layered validation approach helps reduce unnecessary face processing operations while improving attendance accuracy and reducing attendance fraud. 

1 

The system also includes an automatic SMS notification service that helps improve communication between the institute and parents. SMS notifications can be sent for attendance confirmations, absence alerts, payment reminders, study area booking notifications, and important institute announcements. 

Another important feature of the proposed system is the Smart Study Area and Library Booking System. Students can reserve study spaces within the institute for a fixed duration of four hours. Once a booking is confirmed, the selected study area is allocated to the student for four hours. Students are required to confirm their arrival within fifteen minutes after the booking start time. If the student does not arrive within the given time period, the booking is automatically cancelled and the study area becomes available for another student. 

The system further supports payment management functionalities including monthly fee handling, payment history tracking, receipt generation, online payment confirmation uploads, and payment verification processes. Additionally, examination and quiz marks can be managed using Excel-based mark uploads to simplify academic record management activities. 

The proposed system supports four main user roles: Admin, Counter Person, Teacher, and Student. Admin users manage overall institute operations, class scheduling, hall allocations, financial activities, reports, and website content. Counter Persons handle registrations, attendance management, payments, and communication services. Teachers manage learning materials, examination records, and student-related academic activities. Students can access attendance records, timetables, payment details, learning materials, and study area booking services through their personal dashboard. 

Additionally, the system includes website and homepage management functionalities that allow the institute to display teacher profiles, announcements, class information, and promotional flyers dynamically. 

Overall, the proposed solution aims to improve operational efficiency, reduce manual administrative workload, strengthen attendance management, improve parent communication, and provide a centralized digital platform for managing class and institute operations efficiently. 

2 

## **1.3 Background and Motivation** 

Tuition institutes play a major role in the Sri Lankan education system, especially for students preparing for G.C.E. Ordinary Level (O/L) and Advanced Level (A/L) examinations. A large number of students attend tuition classes and professional courses to improve academic performance and increase opportunities for higher education and career development [1]. As student enrollment in tuition institutes continues to increase, institutes are required to manage large volumes of student records, attendance information, payments, class schedules, and communication activities efficiently. 

However, many tuition institutes in Sri Lanka still rely on manual or semi-manual management methods for attendance marking, payment handling, student registration, and administrative activities [2]. These traditional methods consume considerable time, increase administrative workload, and create difficulties when managing large student populations. Attendance management is one of the most challenging operational activities within tuition institutes. 

In many institutes, attendance is recorded manually using attendance cards, signaturebased methods, or paper records before the beginning of each class session. These approaches may lead to duplicate attendance records, inaccurate data handling, and delays in generating attendance reports. Previous studies have shown that QR codebased attendance systems can improve attendance management efficiency and reduce manual errors compared to traditional paper-based attendance systems [3]. Similarly, image-processing, classroom occupancy estimation, and CCTV-based people counting techniques are increasingly being used in modern attendance validation systems to improve attendance accuracy and operational efficiency [7]. Recent approaches combine occupancy estimation with conditional identity verification methods such as face detection to reduce unnecessary computational overhead while improving fake attendance detection capabilities [8]. 

Another challenge faced by tuition institutes is the difficulty of maintaining effective communication between institutes and parents. Parents often do not receive timely information regarding student attendance, absence, payment status, or important academic notices. Research has shown that parent notification systems and digital 

3 

communication services can improve parent awareness and student monitoring efficiency [5]. 

Many tuition institutes also face difficulties in managing class schedules, hall allocations, and student study areas efficiently. As the number of students increases, managing classroom allocations and study area reservations manually becomes difficult and time-consuming. Centralized management systems can help improve operational efficiency, resource utilization, and administrative management within educational institutions [6]. 

In addition to academic and administrative management, tuition institutes increasingly require digital platforms for managing institute information, announcements, class schedules, and promotional activities. Centralized website management systems help institutes improve communication with students and parents while simplifying institute information management activities. 

The motivation behind this project is to develop a smart and centralized class management platform specifically designed for Sri Lankan tuition institutes. The proposed system integrates student management, smart attendance validation, payment handling, study area booking, hall allocation, communication services, Moodle integration support, and website management into a single digital platform. The system is expected to reduce manual administrative workload, improve attendance management efficiency, strengthen parent communication, and provide better operational management support for Thusitha Institute. 

## **1.4 Problem in Brief** 

Many tuition institutes in Sri Lanka still rely on manual or semi-manual methods for managing attendance, payments, student registrations, class scheduling, and administrative activities. As the number of students, teachers, and classes increases, these traditional management approaches become difficult to maintain efficiently. Existing tuition management systems mainly focus on basic administrative tasks and provide limited support for smart attendance verification and study area management functionalities. 

4 

One of the major operational challenges faced by tuition institutes is attendance management. In many institutes, attendance is recorded manually using attendance cards, signatures, or paper-based marking systems before each class session. These methods consume considerable time, increase administrative workload, and may lead to duplicate attendance records, fake attendance records, and inaccurate attendance reporting. QR-based attendance systems improve attendance management efficiency, but they still cannot fully verify whether the correct student is marking attendance. Although QR-based attendance systems improve operational efficiency, students may still mark attendance for absent students using another student’s QR code. Existing systems have limited support for validating whether the number of physically present students matches the recorded attendance count. Therefore, there is a need for an intelligent attendance validation mechanism that can estimate classroom occupancy using CCTV footage and classroom dimension analysis, compare the estimated student count with QR attendance records, and only activate face detection and student identification processes when suspicious attendance mismatches are detected. This approach helps improve attendance verification efficiency while reducing unnecessary face-processing operations and computational cost. 

Another significant issue is the lack of intelligent study area and library allocation management within tuition institutes. Many institutes provide study spaces or library areas for students, but reservations and seat allocations are usually managed manually. This may cause inefficient space utilization, booking conflicts, and difficulties in monitoring actual student attendance for reserved study areas. Students may reserve study spaces and fail to arrive on time, preventing other students from using available resources efficiently. 

Additionally, many tuition institutes face challenges in maintaining effective communication with parents regarding attendance, payments, class notices, and other important information. Manual communication methods consume considerable time and reduce communication efficiency. 

Class scheduling, hall allocation management, payment handling, and student record maintenance also become difficult when managed manually, especially within institutes handling large student populations and multiple class sessions. 

5 

The main problems identified in existing tuition institute management processes are as follows: 

- Manual and inefficient attendance management processes 

- Lack of secure student attendance verification 

- Attendance fraud and duplicate attendance issues 

- Inefficient study area and library allocation management 

- Study area booking conflicts and unused reserved spaces 

- High administrative workload 

- Limited parent communication mechanisms 

- Difficulty managing class schedules and hall allocations 

- Manual payment handling and record management 

- Lack of centralized institute management platforms 

Therefore, there is a need for a smart and centralized class management system that can automate attendance verification, improve study area allocation management, strengthen parent communication, and simplify operational activities within tuition institutes. 

The major novelty features of the proposed solution are the Smart Attendance Validation System and the Smart Study Area Allocation System, which aim to improve attendance security, operational efficiency, and resource management within Thusitha Institute. 

## **1.5 Proposed Solution** 

The proposed solution is a web-based Smart Class Management System developed for Thusitha Institute to automate and improve class and institute management activities through a centralized digital platform. The system integrates student management, smart attendance validation, payment handling, class scheduling, study area allocation, communication services, and website management functionalities into a single system. One of the main novelty features of the proposed solution is the Smart Attendance Validation System. The system supports QR-based attendance marking, CCTV-based classroom occupancy estimation, conditional face detection, and manual attendance management. Initially, the system estimates classroom dimensions and expected 

6 

occupancy levels using CCTV camera calibration and image-processing techniques. Students mark attendance using QR-enabled student ID cards while the system simultaneously estimates the actual number of students physically present inside the classroom using CCTV footage. 

The detected classroom occupancy count is automatically compared with the QR attendance count to identify possible attendance mismatches and suspicious attendance activities. If the attendance count and occupancy estimation are matched within the acceptable threshold, attendance records are validated directly. However, if a mismatch is detected, the system automatically activates face detection and student identification processes to identify students who may have marked proxy attendance or remained absent after attendance marking. This layered attendance verification approach improves operational efficiency while reducing unnecessary face recognition processing and improving attendance fraud detection accuracy. 

A configurable threshold value can be used to tolerate minor counting deviations caused by camera angle limitations or temporary student movement within the classroom. The system automatically records attendance date and time information while generating daily and monthly attendance reports. Parent SMS notifications are also integrated into the attendance management process to inform parents regarding student attendance, absence alerts, payment reminders, and important institute notices. Another major novelty feature of the proposed solution is the Smart Study Area and Library Allocation System. The system allows students to reserve study spaces within the institute library or study environment. Once a booking is confirmed, the selected study area is allocated to the student for a fixed duration of four hours. 

Students are required to confirm their arrival within fifteen minutes after the booking start time through attendance verification. If the student fails to arrive within the allocated time period, the system automatically cancels the booking and releases the study area for another student. After attendance confirmation, the study area remains reserved for the allocated four-hour duration. Students who wish to continue using the study area after the allocated time must create a new booking request. This feature helps improve efficient utilization of institute study resources and reduces booking conflicts. 

7 

The proposed system also includes payment management functionalities for handling monthly fees, course payments, payment verification, receipt generation, and payment history tracking. Online payment confirmation uploads are supported to simplify financial management activities within the institute. 

Additionally, the system supports examination and result management functionalities using Excel-based mark uploads. Teachers can upload examination and quiz marks efficiently while maintaining academic records digitally. Learning materials, assignments, and academic announcements can also be managed through the system. The proposed solution also supports integration with third-party learning management platforms such as Moodle for managing online learning materials, quizzes, and examination-related activities. This approach helps reduce development complexity while improving system scalability and maintainability. The proposed layered attendance validation architecture minimizes unnecessary face recognition operations by using occupancy estimation as the primary validation mechanism and activating face detection only during suspicious attendance situations. This approach improves system scalability, reduces processing overhead, and enhances privacy-aware attendance verification. 

The proposed solution further includes website and homepage management functionalities that allow the institute to display teacher profiles, student achievements, island ranks, announcements, promotional flyers, testimonials, and institute statistics dynamically. 

The system supports four main user roles: 

- Admin 

- Counter Person 

- Teacher 

- Student 

Each user role is provided with specific functionalities and access permissions according to their responsibilities within the institute. 

Overall, the proposed solution aims to reduce manual administrative workload, improve attendance validation accuracy through QR-based attendance and image-based student counting techniques, strengthen communication between the institute and parents, and simplify operational management activities within tuition institutes. The system also 

8 

supports integration with third-party learning management platforms to reduce development complexity while improving scalability and maintainability. Ultimately, the proposed solution provides a smart and centralized digital platform for efficiently managing class and institute operations within Thusitha Institute. 

## **1.6 Project Aim and Objectives** 

## **Aim** 

The main aim of this project is to develop a web-based Smart Class Management System for Thusitha Institute to automate administrative operations, improve attendance validation, strengthen communication between the institute and parents, and provide a centralized platform for managing class and institute activities efficiently. **Objectives** 

1. To develop a centralized class management system for managing students, teachers, classes, payments, and academic records efficiently. 

2. To improve attendance management accuracy and operational efficiency through QR-based attendance, image-based classroom occupancy validation, and manual attendance management methods. 

3. To reduce attendance fraud and proxy attendance issues by comparing QR attendance records with classroom student count estimation using imageprocessing techniques. 

4.[To reduce unnecessary face recognition processing and computational overhead] by activating face detection and student identification only when mismatches are detected between QR attendance records and estimated classroom occupancy levels. 

5.[To improve parent communication by implementing an automatic SMS ] notification  system  for  attendance  alerts,  payment  reminders,  absence notifications, and institute announcements. 

6.[To develop a smart study area and library allocation system for managing ] student study space reservations efficiently. 

7.[To implement automatic booking validation and seat release functionalities for ] improving study area utilization within the institute. 

9 

8. To simplify payment management activities through digital payment tracking, receipt generation, payment verification, and online payment confirmation uploads. 

9. To improve class scheduling and hall allocation management through 

   - centralized timetable and hall management functionalities. 

10. To support digital examination and academic record management using Excelbased mark upload functionalities and third-party learning management platform integrations such as Moodle. 

11. To provide website and promotional management features for displaying teacher profiles, student achievements, announcements, and institute promotional content dynamically. 

12. To reduce manual administrative workload and improve overall operational efficiency within Thusitha Institute through automation of daily management activities. 

## **Chapter 2: Methodology 2.1 Software Development Methodology** 

The proposed Smart Class Management System will be developed using the Agile Scrum Methodology. Agile Scrum methodology is selected because it supports iterative development, modular implementation, continuous improvement, and flexibility in handling changing system requirements throughout the software development life cycle. 

Since the proposed system contains multiple modules such as smart attendance validation, QR-based attendance management, image-based classroom occupancy detection, payment handling, study area booking management, SMS notification services, hall allocation management, Moodle integration, and website management, Agile Scrum provides a suitable development approach for implementing the system incrementally while continuously receiving stakeholder feedback. 

The development process is divided into multiple sprints, where each sprint focuses on implementing a specific set of functionalities and system modules. At the end of each 

10 

sprint, completed functionalities are reviewed and evaluated to identify improvements and ensure that the system requirements are satisfied effectively. 

Agile Scrum methodology also supports better team collaboration, easier requirement modifications, faster issue identification, and continuous testing throughout the project development process. This approach helps ensure that the proposed system can be developed systematically within the given project timeline while maintaining software quality and implementation efficiency. 

The Scrum development process mainly consists of: 

1. Requirement gathering and sprint planning 

2. System design and architecture planning 

3. Sprint-based implementation 

4. Continuous testing and validation 

5. Sprint review and feedback collection 

6. Final system deployment and optimization 

The Agile Scrum methodology is therefore considered suitable for developing the proposed system because it supports incremental system development, continuous stakeholder involvement, efficient integration of third-party platforms, and effective management of complex system functionalities. 

_Figure 1:The Agile–Scrum Framework_ 

11 

## **2.2 Sprint Breakdown** 

## **Sprint 1: Core System Architecture and User Management** 

## **1. Project Initiation and Requirement Planning** 

- Finalize project scope and core functionalities 

- Analysed operational workflow of Thusitha Institute 

- Identify user roles and system modules 

- Finalize functional and non-functional requirements 

## **2. Sprint Planning** 

- Design overall system architecture 

- Design database schema and relationships 

- Plan authentication and authorization system 

- Plan role-based access control mechanisms 

## **3. Sprint Execution** 

- Develop database structure 

- Implement user authentication system 

- • Develop role-based access control 

- Implement Admin dashboard 

- Implement Counter Person dashboard 

- Implement Teacher dashboard 

- Implement Student dashboard 

- Develop student registration management 

- Develop teacher and subject management 

- Develop class and timetable management 

## **4. Sprint Review** 

- Demonstrate authentication functionalities 

- Review dashboard interfaces 

- Validate user role permissions 

- Gather stakeholder feedback 

12 

## **Sprint 2: Smart Attendance and Payment Management System** 

## **1. Project Initiation and Release Planning** 

- Analyse current attendance handling process 

- Define attendance verification workflow 

- Define payment management requirements 

- Analyse institute payment operations 

## **2. Sprint Planning** 

- Plan QR code generation and validation process 

- Plan image-based classroom occupancy validation workflow 

- Design attendance tracking interfaces 

- Design payment management interfaces 

- Plan SMS notification integration 

- Plan classroom dimension estimation workflow 

- Plan CCTV camera calibration process 

- Plan conditional face detection workflow 

## **3. Sprint Execution** 

- Implement student ID generation 

- Implement QR code generation 

- Develop image-based student counting and occupancy detection module 

- Develop QR attendance scanning module 

- Implement classroom dimension estimation module 

- Implement CCTV-based occupancy estimation 

- Implement QR attendance and classroom student count comparison validation 

- Implement attendance validation and duplicate prevention 

- Implement automatic attendance percentage calculations 

- Detect suspicious attendance mismatches using classroom occupancy estimation 

- Develop monthly payment management 

- Implement receipt generation 

- Develop payment history tracking 

- Integrate parent SMS notification services 

13 

- Implement online payment confirmation upload functionality 

- Develop conditional face detection activation mechanism 

- Implement suspicious student identification module 

## **4. Sprint Review** 

- Demonstrate attendance management functionalities 

- Review image-based attendance validation system 

- Test QR attendance workflow 

- Validate payment management functionalities 

- Gather stakeholder feedback 

## **Sprint 3: Smart Study Area and Hall Allocation Management System** 

## **1. Project Initiation and Release Planning** 

- Analyse study area reservation workflow 

- Define study area allocation requirements 

- Analyse hall allocation and scheduling processes 

- Define booking validation requirements 

## **2. Sprint Planning** 

- Design study area booking workflow 

- Plan automatic booking validation process 

- Design hall allocation management interfaces 

- Plan booking notification services 

## **3. Sprint Execution** 

- Develop study area reservation system 

- Implement seat allocation management 

- Implement four-hour booking duration handling 

- Develop fifteen-minute attendance confirmation validation 

- Implement automatic booking cancellation 

- Develop automatic seat release mechanism 

- Implement booking history management 

14 

- Develop hall allocation management system 

- Implement timetable conflict prevention 

- Integrate booking-related SMS notifications 

## **4. Sprint Review** 

- Demonstrate study area booking functionalities 

- Review booking validation and seat release processes 

- Validate hall allocation management functionalities 

- Gather stakeholder feedback 

## **Sprint 4: Examination, Website, Testing, and Final Optimization** 

## **1. Project Initiation and Release Planning** 

- Define examination management requirements 

- Analyse learning material management workflow 

- Define website and promotional management requirements 

- Plan system testing procedures 

- Prepare deployment environment 

## **2. Sprint Planning** 

- Design examination result management workflow 

- Plan Excel-based mark upload functionalities 

- Design website management interfaces 

- Plan promotional content management functionalities 

- Plan optimization and validation tasks 

## **3. Sprint Execution** 

- Develop examination result management system 

- Implement Excel-based mark upload functionality 

- Develop academic record management 

- Implement learning material upload and download system 

- Develop assignment and notice management 

- Integrate third-party learning management platform support (Moodle) 

15 

- Implement homepage management system 

- Develop teacher showcase management 

- Implement student achievement and island rank management 

- Develop testimonial and promotional flyer management 

- Implement institute announcement management 

- Conduct unit testing 

- Conduct integration testing 

- Conduct system testing 

- Conduct user acceptance testing 

- Optimize system performance 

- Fix identified system issues 

- Configure deployment environment 

- Deploy the final system 

## **4. Sprint Execution** 

- Conduct final system demonstration 

- Validate overall system functionalities 

- Review system performance and security 

- Collect final stakeholder feedback 

- Finalize project documentation 

## **Chapter 3: Requirements Identification** 

## **3.1 Functional Requirements** 

## **1. User Authentication and Role Management** 

- Users can securely log into the system according to their assigned roles. 

- Role-based access control is provided for Admin, Counter Person, Teacher, and Student users. 

- Users can securely log out from the system. 

- Password reset and account recovery functionalities are supported. 

16 

## **2. Student Management** 

- Admin and Counter Person can register new students. 

- The system automatically generates unique student IDs. 

- Student personal information and parent details can be managed through the system. 

- Student records can be searched, filtered, updated, activated, or deactivated. 

- Student profile photos can be uploaded and managed. 

## **3. Teacher and Subject Management** 

- Admin can add, update, and manage teacher profiles. 

- Teachers can be assigned to classes and subjects. 

- Subjects, grades, and professional courses can be managed through the system. 

- • The system supports multiple teachers for the same subject, allowing students to enroll in classes conducted by their preferred teacher. 

## **4. ClassandTimetableManagemen** t 

- Classes, schedules, and hall allocations can be managed by Admin and Counter Person. 

- Timetables can be generated and updated through the system. 

- Teachers and Students can view their assigned class schedules. 

- Classroom schedule conflicts are automatically detected and prevented 

## **5. Smart Attendance Management** 

- QR codes are automatically generated using student ID numbers. 

- Students can mark attendance using QR code scanning. 

- The system estimates classroom dimensions and occupancy capacity using CCTV camera calibration techniques. 

- The system estimates actual classroom student count using CCTV images and image-processing techniques. 

- QR attendance count and detected classroom student count are automatically compared. 

- Suspicious attendance mismatches are identified automatically. 

17 

- Face detection and student identification processes are activated only when attendance mismatches are detected. 

- The system identifies students who may have marked proxy attendance or remained absent after attendance marking. 

- Attendance date and time are recorded automatically. 

- The system prevents multiple attendance markings for the same student during a single class session. 

- Counter Person can manually update attendance when necessary. 

- Attendance percentages are calculated automatically. 

- Attendance reports can be generated daily and monthly. 

## **6. Parent SMS Notification System** 

- Parents receive automatic SMS notifications after student attendance marking. 

- Payment reminders can be sent to parents through SMS notifications. 

- Absence alerts and important academic notices can be delivered automatically. 

- Examination and class-related announcements can be communicated through SMS services. 

## **7. Payment Management System** 

- Counter Person can manage monthly student payments and course fees. 

- Payment history records are maintained within the system. 

- Printable payment receipts are generated automatically. 

- Unpaid and overdue payments can be identified easily. 

- Students can view their payment status through their dashboard. 

- Students and parents can upload online payment confirmations. 

- Payment verification and approval can be managed by Counter Person. 

## **8. Smart Study Area and Library Allocation System** 

- Students can reserve study areas and library spaces through the system. 

- Study spaces are allocated for a fixed duration of four hours. 

- Students must confirm attendance within fifteen minutes after booking start time. 

18 

- Bookings are automatically cancelled if attendance is not confirmed within the required time. 

- Automatically cancelled study spaces become available for other students. 

- Students can create new bookings after booking expiration. 

- Study area booking history can be managed through the system. 

## **9. Examination and Result Management** 

- Teachers can upload examination and quiz marks using Excel sheets. 

- Uploaded Excel files are processed automatically by the system. 

- Examination schedules can be managed through the system. 

- Student academic records and examination results can be maintained digitally. 

- Students can view examination results through their dashboard. 

- The system supports integration with third-party learning management platforms such as Moodle for managing quizzes and online learning activities. 

## **10. Learning Material Management** 

- Teachers can upload notes, assignments, videos, and learning materials. 

- Students can download uploaded learning resources. 

- Assignment notices and academic announcements can be shared through the system. 

- Learning materials and online academic activities can also be managed through third-party learning management platform integrations such as Moodle. 

## **11. Website and Promotional Management** 

- Homepage banners, flyers, and promotional content can be managed dynamically. 

- Teacher profiles and showcases can be displayed through the website. 

- Student achievements and island rank showcases can be managed through the system. 

- Announcements, and institute statistics can be displayed dynamically. 

## **12. Reporting System** 

- Attendance reports can be generated daily and monthly. 

19 

- Payment-related reports can be generated by the Admin. 

- Student registration reports can be generated through the system. 

- Hall allocation and study area booking reports are supported by the system. 

## **3.2 Non-Functional Requirements** 

## **1.Performance** 

The system should process QR attendance marking, classroom occupancy estimation, and attendance validation with minimal delay. CCTV-based student counting and occupancy analysis should operate efficiently in real time within classroom environments. Face detection and student identification processes should only be activated when attendance mismatches are detected in order to reduce computational overhead and improve overall system performance. The system should support multiple users accessing the system simultaneously without significant performance reduction. 

## **2.Security** 

User authentication and role-based access control should be implemented to restrict unauthorized access. Passwords should be encrypted before storage. QR attendance validation and image-based attendance verification mechanisms should help prevent fake or duplicate attendance records. Payment information and student records should be securely managed within the system. 

## **3.Usability** 

The system should provide a user-friendly and easy-to-use interface that is understandable for Admin, Counter Person, Teachers, and Students. Navigation between system modules should be simple, efficient, and responsive across supported devices. 

## **4.Reliability** 

The system should maintain accurate attendance, payment, booking, and academic records. Backup and recovery mechanisms should be available to prevent data loss. 

20 

Attendance and booking validation functionalities should operate consistently without affecting system reliability. 

## **5.Scalability** 

The system should support increasing numbers of students, teachers, classes, and study area reservations efficiently. The database structure and system architecture should support future feature expansion, third-party platform integrations, and institutional growth. 

## **3.3 System Requirements** 

## **3.3.1 Hardware Requirements** 

## **Development Environment:** 

- Laptop or desktop computer 

- Dual-core processor or equivalent 

- Minimum 4GB RAM 

- Minimum 100GB available storage 

- Stable internet connection 

## **Production Environment:** 

- Web server with minimum 8GB RAM 

- Multi-core processor 

- Minimum 500GB storage 

- Reliable internet connection 

- Backup storage support 

## **Additional Hardware** 

- Smartphones or devices with camera support for QR attendance scanning. 

- CCTV cameras or camera-supported devices for classroom occupancy detection and attendance validation 

- Printer for student ID cards and payment receipts. 

- Internet connection for system access and SMS services. 

21 

## **3.3.2 Software Requirements** 

## **DevelopmentTools:** 

- VisualStudioCode (VS Code) 

- GitHubforversion control 

- Figmaforinterface designing 

- PostmanforAPI testing 

## **Database Management System** : 

- PostgreSQL 

## **Operating Systems:** 

- Windows10/11, Linux (optional for deployment) 

## **Web Browsers:** 

- GoogleChrome 

- MicrosoftEdge 

- Mozilla Firefox 

## **Additional Software and Services** 

- QR Code Generation Library 

- OpenCV / Image ProcessingLibrary 

- Classroom Occupancy Detection or Object Detection Model 

- • SMS API Service 

- Excel Processing Library 

## **3.3.3 Technologies Frontend Technologies** 

- React.js 

- Tailwind CSS 

- JavaScript 

- AJAX 

- Chart.js 

22 

## **Backend Technologies** 

- Node.js 

- Express.js 

- REST API Development 

- JWT Authentication 

## **Database Technologies** 

- PostgreSQL 

- pgAdmin 

## **Attendance and Verification Technologies** 

- QR Code Generation Library 

- Object Detection and People Counting Algorithms 

- Face Detection and Student Verification Frameworks 

- CCTV Camera Calibration Techniques 

- OpenCV-based Image Processing 

## **External Integrations** 

- SMS API Integration 

- Online Payment Confirmation Support 

- Moodle LMS Integration Support 

## **Development and Testing Tools** 

- Visual Studio Code (VS Code) 

- GitHub for Version Control 

- Postman for API Testing 

- Figma for User Interface Designing 

## **Deployment Technologies** 

- Versal 

- Cloud Hosting Services (Optional) 

23 

## **Supported Platforms** 

- Windows 10 / 11 

- Linux (Optional for deployment) 

## **Supported Web Browsers** 

- Google Chrome 

- Microsoft Edge 

- Mozilla Firefox 

## **3.4 User Roles** 

## **1.Admin** 

## **Access Level** 

Complete system control and management access. 

## **Description:** 

The Admin is the primary authority of the system and is responsible for managing overall institute operations, attendance management, financial activities, user management, class scheduling, study area allocation management, reporting functionalities, and website management activities. The Admin monitors overall institute performance and manages major system functionalities through centralized dashboards and management interfaces. **Features:** 

- Manage students, teachers, and Counter Person accounts 

- Manage classes, subjects, grades, and professional courses 

- Assign teachers to classes and subjects 

- Monitor QR attendance records and classroom occupancy validation activities 

- View attendance reports and booking reports 

- Manage payment operations and financial reports 

- Manage study area allocation and hall management 

24 

- Manage website content, promotional flyers, and announcements 

- Manage student achievement showcases and island ranks 

- Access operational dashboards and reports 

- Manage user permissions, security settings, and system configurations 

## **2. Counter Person** 

## **Access Level:** 

Administrative and operational management access. 

## **Description** 

Counter Person is responsible for handling daily operational and 

administrative activities within the institute. They support student registration, attendance management, payment handling, communication services, booking management, and daily institute operations. 

## **Features:** 

- Register and manage student information 

- Generate QR-based student ID cards 

- Handle attendance management and manual attendance corrections 

- Support attendance validation and classroom occupancy monitoring 

- Manage monthly payments and generate receipts 

- Verify online payment confirmations 

- Send SMS notifications and reminders to parents 

- Manage study area booking operations 

- Manage class schedules and hall allocations 

- Handle student and parent inquiries 

- Support academic and administrative record management 

25 

## **3. Teacher** 

## **Access Level** 

Academic management and student monitoring access. 

## **Description** 

Teachersareresponsible for managing academic-related activities within the system.Theycan monitor student attendance, upload examination results, 

managelearning materials, and support student academic activities through the system. 

## **Features** 

- Viewassigned classes, schedules, and student lists 

- Uploadexamination and quiz marks using Excel sheets 

- Uploadnotes, assignments, and learning materials 

- Monitorstudent attendance and participation 

- Accessexamination and academic records 

- Shareacademic announcements and assignment notices 

- Viewclassschedules and timetables 

## **4. Student** 

## **Access Level** 

Personal academic and learning access. 

## **Description** 

Students canaccess their personal academic information, attendance records, payment information, study area booking services, and learning resources through the system. The system provides students with centralized access to institute services and academic activities. 

## **Features** 

- View attendance records and attendance percentages 

- Access class schedules and timetables 

- View examination results and academic records 

26 

- Access study area and library booking services 

- View booking history and booking status 

- Download notes, assignments, and learning materials 

- View payment status and institute notices 

- Access QR-based student identification information 

## **Chapter 4: Project Plan (Gantt chart)** 

_Figure 2: The Gantt chart_ 

27 

## **References** 

[1] Department of Examinations, Sri Lanka. 2024. G.C.E. (A/L) Examination Statistics and Performance Reports. 

[2] R.S. Pressman. 2014. Software Engineering: A Practitioner’s Approach. 8th Edition. McGraw-Hill Education. 

[3] D. Pant. 2017. Smart Attendance System Applying QR Code. Proceedings of the International Conference on Engineering Technologies and Management. 

[4] J. Hendrawan. 2025. QR Code-Based Attendance Systems in Education. Conference on Education, Social Sciences and Management Studies. 

[5] P. Bergman. 2019. Parent-Child Information Frictions and Human Capital Investment. Journal of Political Economy. 

[6] S. Kumar and R. Singh. 2021. Web-Based Booking and Resource Allocation System for Educational Institutions. International Journal of Computer Applications. 

[7] Z. Ma and A. B. Chan. 2013. Crossing the Line: Crowd Counting by Integer Programming with Local Features. IEEE Conference on Computer Vision and Pattern Recognition. 

[8] W. Li, H. Zhao, and F. Wang. 2020. Deep Learning-Based Face Detection and Attendance Verification System. International Journal of Advanced Computer Science and Applications. 

28 

## **Appendixes** 

**==> picture [50 x 264] intentionally omitted <==**

**----- Start of picture text -----**<br>
UseRs<br>Admin / Owner<br>pera<br>+ Verw repeets & enatytiey<br>pecceepacnane<br>Counter Person<br>+ Marae regestr ations<br>+ Manage attendants<br>phen esrasull<br>Teacher<br>+ Vers thatent progress<br>+ Atendance mentering<br>=+ ViewGotenen tome te rnte<br>+ScottOurada materi<br>ce?<br>|<br>ASS Gateway<br>SenAe perentanatonts St eeteatiorse<br>**----- End of picture text -----**<br>


## _Figure 3: System Architectural Diagram_ 

29 

