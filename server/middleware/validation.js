const Joi = require('joi');

// Validation schemas
const jobSchema = Joi.object({
  company: Joi.string().trim().min(1).max(100).required()
    .messages({
      'string.empty': 'Company name is required',
      'string.min': 'Company name must be at least 1 character long',
      'string.max': 'Company name cannot exceed 100 characters'
    }),
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Job title is required',
      'string.min': 'Job title must be at least 1 character long',
      'string.max': 'Job title cannot exceed 200 characters'
    }),
  status: Joi.string().valid('wishlist', 'applied', 'interview', 'offer', 'rejected').required()
    .messages({
      'any.only': 'Status must be one of: wishlist, applied, interview, offer, rejected'
    }),
  application_date: Joi.date().iso().allow(null, '')
    .messages({
      'date.format': 'Application date must be a valid date (YYYY-MM-DD)'
    }),
  deadline: Joi.string().trim().max(100).allow('', null)
    .messages({
      'string.max': 'Deadline cannot exceed 100 characters'
    }),
  notes: Joi.string().trim().max(1000).allow('', null)
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  link: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'Link must be a valid URL'
    }),
  location: Joi.string().trim().max(100).allow('', null)
    .messages({
      'string.max': 'Location cannot exceed 100 characters'
    }),
  cover_letter: Joi.string().trim().max(5000).allow('', null)
    .messages({
      'string.max': 'Cover letter cannot exceed 5000 characters'
    }),
  job_description: Joi.string().trim().max(10000).allow('', null)
    .messages({
      'string.max': 'Job description cannot exceed 10000 characters'
    }),
  hiring_manager: Joi.string().trim().max(100).allow('', null)
    .messages({
      'string.max': 'Hiring manager cannot exceed 100 characters'
    }),
  salary: Joi.string().trim().max(100).allow('', null)
    .messages({
      'string.max': 'Salary cannot exceed 100 characters'
    }),
  job_type: Joi.string().trim().max(50).allow('', null)
    .messages({
      'string.max': 'Job type cannot exceed 50 characters'
    }),
  requirements: Joi.string().trim().max(5000).allow('', null)
    .messages({
      'string.max': 'Requirements cannot exceed 5000 characters'
    }),
  benefits: Joi.string().trim().max(5000).allow('', null)
    .messages({
      'string.max': 'Benefits cannot exceed 5000 characters'
    })
});

const coverLetterSchema = Joi.object({
  jobTitle: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Job title is required',
      'string.min': 'Job title must be at least 1 character long',
      'string.max': 'Job title cannot exceed 200 characters'
    }),
  company: Joi.string().trim().min(1).max(100).required()
    .messages({
      'string.empty': 'Company name is required',
      'string.min': 'Company name must be at least 1 character long',
      'string.max': 'Company name cannot exceed 100 characters'
    }),
  jobDescription: Joi.string().trim().max(5000).allow('', null)
    .messages({
      'string.max': 'Job description cannot exceed 5000 characters'
    }),
  resume: Joi.string().trim().min(10).max(10000).required()
    .messages({
      'string.empty': 'Resume is required',
      'string.min': 'Resume must be at least 10 characters long',
      'string.max': 'Resume cannot exceed 10000 characters'
    })
});

// Validation middleware
const validateJob = (req, res, next) => {
  const { error, value } = jobSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      error: 'Validation failed',
      messages: errorMessages
    });
  }
  
  // Sanitize the data
  req.body = value;
  next();
};

const validateCoverLetter = (req, res, next) => {
  const { error, value } = coverLetterSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      error: 'Validation failed',
      messages: errorMessages
    });
  }
  
  req.body = value;
  next();
};

module.exports = {
  validateJob,
  validateCoverLetter
}; 