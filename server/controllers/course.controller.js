import Course from '../models/course.model.js';
import AppError from '../utils/error.util.js';

const getAllCourses = async (req, res, next) => {
  
  try {
    const courses = await Course.find({});
    console.log(courses)

    return res.status(200).json({
      success: true,
      message: 'Successfully fetched all courses',
      courses:courses
    });
  } catch (e) {
    return next(new AppError('Failed to get all courses', 404));
  }
};
const insertData = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      createdBy,
      lectureTitle,
      lectureDescription,
      email // using email as a stand-in for public_id
    } = req.body;

    const newCourse = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        public_id: email,
        secure_url: 'https://res.cloudinary.com/dfwqzjz4j/image/upload'
      },
      lectures: [
        {
          title: lectureTitle,
          description: lectureDescription,
          lecture: {
            public_id: email,
            secure_url: 'https://res.cloudinary.com/dfwqzjz4j/image/upload'
          }
        }
      ],
      numberOfLectures: 1
    });


    res.status(201).json({
      success: true,
      message: 'Course inserted successfully',
      course: newCourse
    });

  } catch (error) {
    next(error);
  }
};

const getLecturesByCourseId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    return res.status(200).json({
      success: true,
      message: 'Lectures fetched successfully',
      lectures: course.lectures,
      courseTitle: course.title,
    });
  } catch (e) {
    return next(new AppError('Failed to get lectures', 400));
  }
};

export {
  getAllCourses,
  getLecturesByCourseId,
  insertData
};
