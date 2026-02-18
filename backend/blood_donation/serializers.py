from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, Donor, Hospital, DonationSchedule, DonationRecord, BloodRequest


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')


class DonorProfileSerializer(serializers.ModelSerializer):
    """Serializer for donor profile"""
    user = UserSerializer(read_only=True)
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Donor
        fields = ('id', 'user', 'age', 'weight', 'phone', 'location', 'blood_type', 'health_info', 
                  'profile_image', 'profile_image_url', 'total_donations', 
                  'lives_saved', 'created_at', 'updated_at')
        read_only_fields = ('total_donations', 'lives_saved', 'created_at', 'updated_at')
    
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


class DonorCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating donor profile"""
    class Meta:
        model = Donor
        fields = ('age', 'weight', 'phone', 'location', 'blood_type', 'health_info', 'profile_image')
        extra_kwargs = {
            'age': {'required': False, 'allow_null': True},
            'weight': {'required': False, 'allow_null': True},
            'phone': {'required': False, 'allow_blank': True},
            'location': {'required': False, 'allow_blank': True},
            'blood_type': {'required': False, 'allow_null': True, 'allow_blank': True},
        }
    
    def validate_weight(self, value):
        """Validate that weight is above 50kg"""
        if value is not None:
            if value <= 50:
                raise serializers.ValidationError("Weight must be above 50kg to be eligible for blood donation.")
        return value


class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for hospital"""
    class Meta:
        model = Hospital
        fields = ('id', 'name', 'location', 'total_blood_received', 
                  'total_lives_saved', 'created_at', 'updated_at')
        read_only_fields = ('total_blood_received', 'total_lives_saved', 
                           'created_at', 'updated_at')


class DonationScheduleSerializer(serializers.ModelSerializer):
    """Serializer for donation schedule"""
    donor = DonorProfileSerializer(read_only=True)
    donor_id = serializers.IntegerField(write_only=True, required=False)
    preferred_hospital = HospitalSerializer(read_only=True)
    preferred_hospital_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    record = serializers.SerializerMethodField()
    
    class Meta:
        model = DonationSchedule
        fields = ('id', 'donor', 'donor_id', 'preferred_hospital', 'preferred_hospital_id',
                  'scheduled_date', 'donation_type', 'status', 'record', 'created_at', 'updated_at')
        read_only_fields = ('status', 'created_at', 'updated_at')
    
    def get_record(self, obj):
        if hasattr(obj, 'record'):
            record = obj.record
            return {
                'id': record.id,
                'hospital': {
                    'id': record.hospital.id if record.hospital else None,
                    'name': record.hospital.name if record.hospital else None,
                } if record.hospital else None,
                'donation_date': record.donation_date,
                'blood_amount': str(record.blood_amount),
            }
        return None
    
    def create(self, validated_data):
        # Remove donor_id if present, donor will be set from request user
        validated_data.pop('donor_id', None)
        return super().create(validated_data)


class DonationScheduleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating donation schedule"""
    preferred_hospital_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = DonationSchedule
        fields = ('scheduled_date', 'donation_type', 'preferred_hospital_id')
    
    def create(self, validated_data):
        hospital_id = validated_data.pop('preferred_hospital_id', None)
        if hospital_id:
            from .models import Hospital
            validated_data['preferred_hospital'] = Hospital.objects.get(id=hospital_id)
        return super().create(validated_data)


class DonationRecordSerializer(serializers.ModelSerializer):
    """Serializer for donation record"""
    schedule_id = serializers.IntegerField(source='schedule.id', read_only=True)
    hospital = HospitalSerializer(read_only=True)
    hospital_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = DonationRecord
        fields = ('id', 'schedule_id', 'hospital', 'hospital_id', 'donation_date', 
                  'blood_amount')
        read_only_fields = ('donation_date',)


class LoginSerializer(serializers.Serializer):
    """Serializer for login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password.')
        
        return attrs


class BloodRequestSerializer(serializers.ModelSerializer):
    """Serializer for blood requests"""
    requester_name = serializers.ReadOnlyField(source='requester.username')
    
    class Meta:
        model = BloodRequest
        fields = '__all__'
        read_only_fields = ('requester', 'created_at', 'is_fulfilled')
