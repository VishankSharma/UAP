import Course from '../models/course.model.js';
import AppError from '../utils/error.util.js';
import fs from 'fs/promises';
import cloudinary from 'cloudinary';

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

const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      createdBy
    } = req.body;

          if(!title || !description || !category || !createdBy){
        return next(new AppError('Please fill in all fields', 400));
      }

    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail:{
        public_id:"dummy",
        secure_url:"dummy"
      }
      });
     
    if(!course){
     return next(new AppError('course could not created,please try again',500))
    }

  if(req.file){
    const result = await cloudinary.v2.uploader.upload(req.file.path,{
      folder: 'lms',
    })

   if(result){
    course.thumbnail.public_id = result.public_id
    course.thumbnail.secure_url = result.secure_url
   }

  fs.rm(`uploads/${req.file.filename}`)
  }

  await course.save()

   res.status(201).json({
      success: true,
      message: 'Course inserted successfully',
      course:course
    });

  } catch (error) {
  return next(new AppError(error.message,400));
  }
};

const updateCourse = async (req,res,next)=>{
  try {
  const {id} = req.params;
  const course = await Course.findByIdAndUpdate(id,{
    $set:req.body
  },{
    runValidators:true
  });

  if(!course){
    return next(new AppError('Course not found',404))
  }

  res.status(200).json({
    success:true,
    message:'Course updated successfully',
    course:course
  })
    
  } catch (e) {
    return next(new AppError(e.message,400));
  }
}

const removeCourse = async (req,res,next)=>{
try {
  const {id} = req.params;
  const course = await Course.findById(id);

  if(!course){
    return next(new AppError('Course does not exist',404))
  }

  await Course.findByIdAndDelete(id);

  res.status(200).json({
    success:true,
    message:'Course removed successfully', 
  })
} catch (e) {
  return next(new AppError(e.message,400));
}
}

const addLectureToCoureById = async(req,res,next)=>{
   const {title,description} = req.body
   const {id} = req.params

   if(!title || !description){
    return next(new AppError('Please provide both title and description',400))
   }

  const course = await Course.findById(id)

  if(!course){
    return next(new AppError('Course does not exist',404))
  }

  const lectureData = {
    title,
    description,
    lecture:{}

  }

  if(req.file){
    const result = await cloudinary.v2.uploader.upload(req.file.path,{
      folder: 'lms',
  })

  if(result){
    lectureData.lecture.public_id = result.public_id
    lectureData.lecture.secure_url=result.secure_url
  }
  fs.rm(`uploads/${req.file.filename}`)

 }

 course.lectures.push(lectureData)

 course.numberOfLectures = course.lectures.length

 await course.save()

 res.status(200).json({
 success:true,
 message:'Lecture added successfully',
 course
 })
}


export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLectureToCoureById
}
