import Tour from './tourModel';
import TourSchedule from './tourSchedule';

//quan hệ 1-nhiều
Tour.hasMany(TourSchedule, {
  foreignKey: 'tourId',
  as: 'schedules',
  onDelete: 'CASCADE',
});
TourSchedule.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });
export { Tour, TourSchedule };
