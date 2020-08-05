// INSTRUCTIONS:
/*
  Create a new resource controller that uses the
  User as an associative collection (examples):
  - User -> Books
  - User -> Reservation

  The resource controller must contain the 7 resource actions:
  - index
  - show
  - new
  - create
  - edit
  - update
  - delete
*/

const viewPath = 'cars';
const Car = require('../models/car');
const User = require('../models/User');



exports.index = async (req, res) => {
  try {
    const cars = await Car
      .find()
      .populate('user')
      .sort({updatedAt: 'desc'});
    res.status(200).json(cars);
  } catch (error) {
    res.status(400).json({message: 'There was an error fetching the car profile', error});
  }
};

exports.show = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
    .populate('user');
    res.status(200).json(car);
  } catch (error) {
    res.status(400).json({message: "There was an error showing the car profile"});
  }
};
exports.new = (req, res) => {
  res.render(`${viewPath}/new`, {
    pageTitle: 'Add new car'
  });
};
exports.create = async (req, res) => {
  try {
    const { user: email } = req.session.passport;
    const user = await User.findOne({email: email});
    const car = await Car.create({user: user._id, ...req.body});
    res.status(200).json(car);
  } catch (error) {
    res.status(400).json({message: "There was an error creating the car profile", error});
  }
};
exports.edit = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    res.render(`${viewPath}/edit`, {
      pageTitle: car.title,
      formData: car
    });
  } catch (error) {
    req.flash('danger', `There was an error accessing this car information: ${error}`);
    res.redirect(`/`);
  }
};
exports.update = async (req, res) => {
  try {
    const { user: email } = req.session.passport;
    const user = await User.findOne({email: email});

    let car = await Car.findById(req.body.id);
    if (!car) throw new Error('The car information could not be found');
    
    const attributes = {user: user._id, ...req.body};
    await Car.validate(attributes);
    await Car.findByIdAndUpdate(attributes.id, attributes);
    
    req.flash('success', 'The car information was updated successfully');
    res.redirect(`/cars/${req.body.id}`);
  } catch (error) {
    req.flash('danger', `There was an error updating this car information. Check your errors: ${error}`);
    res.redirect(`/cars/${req.body.id}/edit`);
  }
};
exports.delete = async (req, res) => {
  try {
    await Car.deleteOne({_id: req.body.id});
    res.status(200).json({message: "Yay"});
  } catch (error) {
    res.status(400).json({message: "There was an error deleting the blog"});
  }
};