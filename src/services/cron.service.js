var CronJob = require('cron').CronJob;
const CourseModel = require('../models/courses/course.model');
const DetailInvoiceModel = require('../models/detailInvoice.model');

var jobSetTagCoursesMonthly = new CronJob(
    '0 0 0 1 * *', // 00:00:00 ngày 1 mỗi tháng
    async function () {
        // console.log('Xếp nhãn khoá học vào 00:00:00 ngày 1 mỗi tháng');
        let year = new Date().getFullYear()
        let month = new Date().getMonth() + 1 // 0 - 11
        // lấy hoá đơn mỗi tháng
        const invoices = await DetailInvoiceModel.aggregate([
            {
                $project: {
                    courseId: 1,
                    createdAt: 1,
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                }
            },
            {
                $match: {
                    month: month,
                    year: year
                }
            },
            {
                $group: {
                    _id: { courseId: "$courseId" },
                    count: { $count: {} }
                }
            },
            {
                $sort: { "count": -1 }
            },
            {
                $limit: parseInt(process.env.NUMBER_TOP_COURSE || 5)
            }
        ])

        let ids = invoices.map(item => { return item._id.courseId })
        // gắn nhãn
        await CourseModel.updateMany({ _id: { $in: ids } }, { type: 'Bestseller' })
        // xoá nhãn
        await CourseModel.updateMany({ _id: { $nin: ids } }, { type: null })
    },
    null,
    true,
    'Asia/Ho_Chi_Minh'
);

module.exports = jobSetTagCoursesMonthly