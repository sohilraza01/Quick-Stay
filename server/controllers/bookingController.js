import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// Function to Check Room Availablity of Room


const checkAvailablity = async ({checkInDate,checkOutDate,room}) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate:{$lte: checkOutDate},
            checkOutDate:{$gte: checkInDate},
        });
        const isAvailable = bookings.lenght === 0;
        return isAvailable;
    } catch (error) { 
        console.log(error.message);
    }
}

export const checkAvailablityAPI = async (req,res) =>{
    try {
        const {room, checkInDate, checkOutDate} = req.body;
        const isAvailable = await checkAvailablity({checkInDate, checkOutDate,room});
        res.json({success:true ,isAvailable});
    } catch (error) {
        res.json({success:false , message: error.message});
    }
}

// API to create a new booking

export const createBooking = async (req,res) =>{
    try {
        const {room, checkInDate, checkOutDate, guests} = req.body;
        const user = req.user._id;
        // Before Booking check availablity
        const isAvailable = await checkAvailablity({
            checkInDate,
            checkOutDate,
            room
        });
        if(!isAvailable){
            return res.json({success:false, message:'Room is not available'})
        }
        // get total price from room
        const roomData = await Room.findById(room).populate('hotel');
        let totalPrice = roomData.pricePerNight;

        // calculate totalPrice based on nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff  = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (100 * 3600 * 24));

        totalPrice *= nights;
        const booking  = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })

        res.json({success:true, message:'Booking Created Successfully'});


    } catch (error) {  
        console.log(error.message); 
       res.json({success:false, message:'Failed to create booking'})
    }
}

// API to get all booking for a user

export const getUserBookings = async (req,res) =>{
    try {
        const user = req.user._id;
        const bookings = await Booking.find({user}).populate('room hottel').sort({createdAt:-1})
        res.json({success:true, bookings})
    } catch (error) {
         res.json({success:false, message:'Failed to fetch bookings'})
    }
    
}


export const getHotelBookings = async (req,res) =>{
    try {
            const hotel = await Hotel.findOne({owner:req.auth.userId});
    if(!hotel){
        return res.json({success:false, message:'No Hotel Found'});
    }
    const bookings = (await Booking.find({hotel:hotel._id}).populate('room hotel user')).toSorted({createdAt: -1});
    // Total Bookings
    const totalBookings = bookings.length;
    //Total Revenue
    const totalRevenue = bookings.reduce((acc,booking)=> acc + booking.totalPrice, 0)

    res.json({success:true, dashboardData: {totalBookings, totalRevenue, bookings}})
    } catch (error) {
         res.json({success:false, message:'Failed to fetch bookings'});
    }
}